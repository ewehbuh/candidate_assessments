from django.db import models

class Candidate(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'

    STATUS_CHOICES = (
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
    )

    name = models.CharField(max_length=256)
    years_exp = models.IntegerField()
    status = models.CharField(choices=STATUS_CHOICES, default=PENDING, max_length=20)
    date_applied = models.DateTimeField()
    reviewed = models.BooleanField(default=False)
    description = models.TextField()

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name