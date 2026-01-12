
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from .models import User, MasterAccessRequest
from .serializers import MasterRequestSerializer, AdminActionSerializer
from .permissions import IsAdmin
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

# 1. Google Login View
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000'
    client_class = OAuth2Client

# 2. Coder: Request Access
class RequestMasterAccessView(generics.CreateAPIView):
    serializer_class = MasterRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 3. Coder: Check Status
class MyRequestsView(generics.ListAPIView):
    serializer_class = MasterRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MasterAccessRequest.objects.filter(user=self.request.user).order_by('-created_at')

# 4. Admin: View All Requests (Pagination is auto-handled by settings)
class AdminRequestListView(generics.ListAPIView):
    queryset = MasterAccessRequest.objects.all().order_by('-created_at')
    serializer_class = MasterRequestSerializer
    permission_classes = [IsAdmin]

# 5. Admin: Take Action
class AdminActionView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AdminActionSerializer(data=request.data)
        if serializer.is_valid():
            req_id = serializer.validated_data['request_id']
            action = serializer.validated_data['action']

            try:
                master_req = MasterAccessRequest.objects.get(id=req_id)
            except MasterAccessRequest.DoesNotExist:
                return Response({"error": "Request not found"}, status=404)

            if action == 'APPROVE':
                master_req.status = 'APPROVED'
                master_req.save()
                # Upgrade the user
                master_req.user.role = User.Roles.MASTER
                master_req.user.save()
            elif action == 'REJECT':
                master_req.status = 'REJECTED'
                master_req.save()
            elif action == 'HOLD':
                master_req.status = 'HOLD'
                master_req.save()

            return Response({"message": f"Request {action}ED successfully"})
        return Response(serializer.errors, status=400)

# 6. Password Reset: Verify User
class PasswordResetVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')

        if not username or not email:
            return Response({"error": "Both username and email are required"}, status=400)

        try:
            user = User.objects.get(username=username, email=email)
        except User.DoesNotExist:
            return Response({"error": "No account found with these credentials"}, status=404)

        # Generate a signed token valid for short duration
        signer = TimestampSigner()
        # We sign the user's ID
        token = signer.sign(str(user.id))
        
        return Response({"message": "Credentials verified", "token": token})

# 7. Password Reset: Confirm & Change
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response({"error": "Token and new password are required"}, status=400)

        signer = TimestampSigner()
        try:
            # Verify token, valid for 15 minutes (900 seconds)
            user_id = signer.unsign(token, max_age=900)
            user = User.objects.get(id=user_id)
            
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successfully"})
            
        except (BadSignature, SignatureExpired):
            return Response({"error": "Invalid or expired token"}, status=400)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)