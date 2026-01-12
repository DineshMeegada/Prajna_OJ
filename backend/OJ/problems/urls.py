from django.urls import path, include
from .views import ProblemListView, ProblemDetailView

urlpatterns = [
    path('problems/', ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:id>/', ProblemDetailView.as_view(), name='problem-detail'),
]