from django.urls import path
from .views import ExecuteCodeView, SubmitCodeView, SubmissionStatusView, SubmissionListView, ReviewCodeView

urlpatterns = [
    path('execute/', ExecuteCodeView.as_view(), name='execute_code'),
    path('submit/', SubmitCodeView.as_view(), name='submit_code'),
    path('submission/<int:submission_id>/', SubmissionStatusView.as_view(), name='submission_status'),
    path('submissions/', SubmissionListView.as_view(), name='submission_list'),

    path('ai-review/', ReviewCodeView.as_view(), name='review_code'),
]