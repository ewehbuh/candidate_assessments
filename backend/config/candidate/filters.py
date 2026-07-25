from django_filters import rest_framework as filters
from .models import Candidate

class CandidateFilter(filters.FilterSet):
    # Range filter for years_exp
    years_exp_min = filters.NumberFilter(field_name='years_exp', lookup_expr='gte')
    years_exp_max = filters.NumberFilter(field_name='years_exp', lookup_expr='lte')

    class Meta:
        model = Candidate
        fields = ['years_exp_min', 'years_exp_max']