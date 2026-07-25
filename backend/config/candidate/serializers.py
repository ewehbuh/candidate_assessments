from rest_framework import serializers
from .models import Candidate
from django.utils import timezone   # <-- IMPORTANT: timezone-aware comparison

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

    # ----- Field-level validation -----
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        return value.strip()

    def validate_years_exp(self, value):
        if value < 0:
            raise serializers.ValidationError("Years of experience cannot be negative.")
        return value

    def validate_date_applied(self, value):
        # Prevent future dates using timezone-aware now
        if value > timezone.now():
            raise serializers.ValidationError("Date applied cannot be in the future.")
        return value

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()

    # ----- Object-level validation (status transitions) -----
    def validate(self, data):
        instance = getattr(self, 'instance', None)

        # For new candidates (POST), ensure status is 'pending'
        if not instance:
            status = data.get('status', Candidate.PENDING)
            if status != Candidate.PENDING:
                raise serializers.ValidationError(
                    {"status": "New candidates must have status 'pending'."}
                )

        # For updates, prevent status change from non-pending
        if instance and instance.status != Candidate.PENDING:
            if 'status' in data and data['status'] != instance.status:
                raise serializers.ValidationError(
                    {"status": "Cannot change status after candidate has been Accepted or Rejected."}
                )

        return data

    # ----- Custom update for reviewed flag -----
    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        if instance.status == Candidate.PENDING and new_status in (Candidate.ACCEPTED, Candidate.REJECTED):
            validated_data['reviewed'] = True
        return super().update(instance, validated_data)