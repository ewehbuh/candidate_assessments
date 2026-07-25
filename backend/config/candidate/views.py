from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Candidate
from .serializers import CandidateSerializer
from .filters import CandidateFilter

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CandidateFilter
    ordering_fields = ['status', 'date_applied', 'years_exp']
    ordering = ['-date_applied']