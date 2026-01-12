from django.urls import path, include
from .views import (
    GoogleLogin, RequestMasterAccessView, MyRequestsView, 
    AdminRequestListView, AdminActionView,
    PasswordResetVerifyView, PasswordResetConfirmView
)
from dj_rest_auth.jwt_auth import get_refresh_view

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('token/refresh/', get_refresh_view().as_view(), name='token_refresh'),
    path('signup/', include('dj_rest_auth.registration.urls')),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    
    # Role Based Access URLs
    path('request-master/', RequestMasterAccessView.as_view(), name='request_master'),
    path('my-requests/', MyRequestsView.as_view(), name='my_requests'),
    path('admin/requests/', AdminRequestListView.as_view(), name='admin_requests'),
    path('admin/action/', AdminActionView.as_view(), name='admin_action'),
    
    # Password Reset
    path('password-reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]