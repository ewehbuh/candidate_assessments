"""
Tests for the Candidate API.

This file contains comprehensive tests covering:
- Model behavior
- API CRUD operations (list, create, retrieve, update)
- Validation rules (field-level and object-level)
- Business logic (auto-update of `reviewed` flag)
- Status transition restrictions
- Range filtering (years_exp_min / years_exp_max)
- Ordering / sorting

All tests use Django's TestCase and Django REST Framework's APITestCase.
"""

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import timedelta
from .models import Candidate


# =========================
#  MODEL TESTS
# =========================

class CandidateModelTest(TestCase):
    """Tests for the Candidate model (non-API)."""

    def setUp(self):
        """Create a sample candidate to test the model."""
        self.candidate = Candidate.objects.create(
            name="John Doe",
            years_exp=5,
            status=Candidate.PENDING,
            date_applied=timezone.now() - timedelta(days=2),
            description="Experienced developer"
        )

    def test_model_str(self):
        """The __str__ method should return the candidate's name."""
        self.assertEqual(str(self.candidate), "John Doe")

    def test_status_choices(self):
        """The `get_status_display()` helper should return the human-readable status."""
        self.assertEqual(self.candidate.get_status_display(), "Pending")


# =========================
#  API TESTS
# =========================

class CandidateAPITest(APITestCase):
    """
    Test suite for the Candidate API endpoints.

    We use APITestCase from Django REST Framework, which provides the
    `client` attribute for making HTTP requests.
    """

    def setUp(self):
        """
        Set up test data before each test method.

        We create three candidates with different statuses and years of experience
        to test filtering, ordering, and status transitions.
        """
        # Candidate 1: pending, 3 years
        self.candidate1 = Candidate.objects.create(
            name="Alice",
            years_exp=3,
            status=Candidate.PENDING,
            date_applied=timezone.now() - timedelta(days=5),
            description="Backend developer"
        )

        # Candidate 2: accepted, 10 years
        self.candidate2 = Candidate.objects.create(
            name="Bob",
            years_exp=10,
            status=Candidate.ACCEPTED,
            date_applied=timezone.now() - timedelta(days=1),
            description="Senior full-stack",
            reviewed=True          # accepted candidates are reviewed
        )

        # Candidate 3: rejected, 25 years
        self.candidate3 = Candidate.objects.create(
            name="Charlie",
            years_exp=25,
            status=Candidate.REJECTED,
            date_applied=timezone.now() - timedelta(days=10),
            description="Lead architect",
            reviewed=True          # rejected candidates are reviewed
        )

        # Define commonly used URL patterns
        self.list_url = reverse('candidate-list')
        # Helper lambda for detail URLs (requires the primary key)
        self.detail_url = lambda pk: reverse('candidate-detail', kwargs={'pk': pk})

    # ----------------------------------------------------------
    #  LIST ENDPOINT
    # ----------------------------------------------------------

    def test_list_candidates(self):
        """
        GET /api/candidates/ should return all candidates with status 200 OK.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)   # all three candidates created

    # ----------------------------------------------------------
    #  CREATE ENDPOINT (POST)
    # ----------------------------------------------------------

    def test_create_candidate_valid(self):
        """
        POST a valid candidate should create a new candidate and return 201.
        - The new candidate should have `reviewed=False` by default.
        - Status must be 'pending' for new candidates.
        """
        data = {
            "name": "New Developer",
            "years_exp": 2,
            "status": "pending",
            "date_applied": "2026-07-25T10:00:00Z",
            "description": "Junior developer"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Candidate.objects.count(), 4)   # one more candidate added
        self.assertEqual(response.data['name'], "New Developer")
        self.assertFalse(response.data['reviewed'])      # new candidates are not reviewed

    def test_create_candidate_invalid_name_empty(self):
        """
        POST with an empty name should return 400 and a validation error.
        """
        data = {
            "name": "   ",
            "years_exp": 2,
            "status": "pending",
            "date_applied": "2026-07-25T10:00:00Z",
            "description": "Valid description"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)   # error should mention the name field

    def test_create_candidate_negative_experience(self):
        """
        POST with negative years of experience should be rejected.
        """
        data = {
            "name": "Invalid Exp",
            "years_exp": -5,
            "status": "pending",
            "date_applied": "2026-07-25T10:00:00Z",
            "description": "Negative experience"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('years_exp', response.data)

    def test_create_candidate_future_date(self):
        """
        POST with a future date_applied should be rejected (prevent time travel).
        """
        future_date = (timezone.now() + timedelta(days=10)).isoformat()
        data = {
            "name": "Future Date",
            "years_exp": 5,
            "status": "pending",
            "date_applied": future_date,
            "description": "Should fail"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_applied', response.data)

    def test_create_candidate_empty_description(self):
        """
        POST with an empty description should be rejected.
        """
        data = {
            "name": "No Description",
            "years_exp": 3,
            "status": "pending",
            "date_applied": "2026-07-25T10:00:00Z",
            "description": ""
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('description', response.data)

    def test_create_candidate_non_pending_status(self):
        """
        New candidates MUST have status 'pending' – any other status is rejected.
        """
        data = {
            "name": "Invalid Status",
            "years_exp": 5,
            "status": "accepted",          # not allowed for new candidates
            "date_applied": "2026-07-25T10:00:00Z",
            "description": "Should be rejected"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    # ----------------------------------------------------------
    #  UPDATE ENDPOINT (PATCH)
    # ----------------------------------------------------------

    def test_update_pending_to_accepted_sets_reviewed(self):
        """
        Changing a pending candidate's status to 'accepted' should set `reviewed=True`.
        """
        candidate = self.candidate1   # pending, reviewed=False
        url = self.detail_url(candidate.id)
        data = {"status": "accepted"}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['reviewed'])
        self.assertEqual(response.data['status'], "accepted")

    def test_update_pending_to_rejected_sets_reviewed(self):
        """
        Changing a pending candidate's status to 'rejected' should set `reviewed=True`.
        """
        candidate = self.candidate1
        url = self.detail_url(candidate.id)
        data = {"status": "rejected"}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['reviewed'])
        self.assertEqual(response.data['status'], "rejected")

    def test_update_other_fields_does_not_change_reviewed(self):
        """
        Updating non-status fields (e.g., description) should NOT alter `reviewed`.
        """
        candidate = self.candidate1   # pending, reviewed=False
        url = self.detail_url(candidate.id)
        data = {"description": "Updated description"}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['reviewed'])   # remained False
        self.assertEqual(response.data['description'], "Updated description")

    def test_update_accepted_candidate_status_blocked(self):
        """
        Once a candidate is ACCEPTED, its status cannot be changed.
        The API should return 400 with an error message.
        """
        candidate = self.candidate2  # accepted
        url = self.detail_url(candidate.id)
        data = {"status": "rejected"}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        # Verify the status did not change in the database
        self.candidate2.refresh_from_db()
        self.assertEqual(self.candidate2.status, Candidate.ACCEPTED)

    def test_update_rejected_candidate_status_blocked(self):
        """
        Once a candidate is REJECTED, its status cannot be changed.
        """
        candidate = self.candidate3  # rejected
        url = self.detail_url(candidate.id)
        data = {"status": "accepted"}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        self.candidate3.refresh_from_db()
        self.assertEqual(self.candidate3.status, Candidate.REJECTED)

    # ----------------------------------------------------------
    #  RANGE FILTERING (years_exp_min & years_exp_max)
    # ----------------------------------------------------------

    def test_filter_by_years_exp_range(self):
        """
        GET /api/candidates/?years_exp_min=5&years_exp_max=20
        Should return candidates with years_exp between 5 and 20 inclusive.
        """
        url = self.list_url + "?years_exp_min=5&years_exp_max=20"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only candidate2 (10) qualifies, candidate3 is 25 (outside range)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.candidate2.id)

    def test_filter_by_years_exp_min_only(self):
        """
        GET with only `years_exp_min` should return candidates with experience >= that value.
        """
        url = self.list_url + "?years_exp_min=10"
        response = self.client.get(url)
        # Candidates 2 (10) and 3 (25) qualify
        self.assertEqual(len(response.data), 2)
        ids = {item['id'] for item in response.data}
        self.assertEqual(ids, {self.candidate2.id, self.candidate3.id})

    def test_filter_by_years_exp_max_only(self):
        """
        GET with only `years_exp_max` should return candidates with experience <= that value.
        """
        url = self.list_url + "?years_exp_max=5"
        response = self.client.get(url)
        # Only candidate1 (3) qualifies
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.candidate1.id)

    # ----------------------------------------------------------
    #  ORDERING / SORTING
    # ----------------------------------------------------------

    def test_ordering_by_status(self):
        """
        GET with `?ordering=status` should return candidates sorted alphabetically by status.
        Status order: 'accepted' < 'pending' < 'rejected' (alphabetically)
        """
        url = self.list_url + "?ordering=status"
        response = self.client.get(url)
        expected_order = ['accepted', 'pending', 'rejected']
        returned_statuses = [item['status'] for item in response.data]
        self.assertEqual(returned_statuses, expected_order)

    def test_ordering_by_date_applied_desc(self):
        """
        GET with `?ordering=-date_applied` should return candidates with newest first.
        """
        url = self.list_url + "?ordering=-date_applied"
        response = self.client.get(url)
        # Extract dates and convert to datetime objects for comparison
        dates = [timezone.datetime.fromisoformat(item['date_applied'].replace('Z', '+00:00')) for item in response.data]
        self.assertTrue(all(dates[i] >= dates[i+1] for i in range(len(dates)-1)))

    def test_ordering_by_years_exp_asc(self):
        """
        GET with `?ordering=years_exp` should return candidates with lowest years first.
        """
        url = self.list_url + "?ordering=years_exp"
        response = self.client.get(url)
        exp = [item['years_exp'] for item in response.data]
        self.assertEqual(exp, sorted(exp))

    def test_ordering_with_filter_combined(self):
        """
        Combine filter (min=5) and ordering (years_exp asc) to ensure they work together.
        """
        url = self.list_url + "?years_exp_min=5&ordering=years_exp"
        response = self.client.get(url)
        # Should return candidate2 (10) and candidate3 (25) in that order
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['id'], self.candidate2.id)  # 10
        self.assertEqual(response.data[1]['id'], self.candidate3.id)  # 25

    # ----------------------------------------------------------
    #  RETRIEVE ENDPOINT
    # ----------------------------------------------------------

    def test_retrieve_candidate(self):
        """
        GET /api/candidates/<id>/ should return the candidate details.
        """
        url = self.detail_url(self.candidate1.id)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.candidate1.name)

    def test_retrieve_non_existent(self):
        """
        GET for a non-existent ID should return 404 Not Found.
        """
        url = self.detail_url(999)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)