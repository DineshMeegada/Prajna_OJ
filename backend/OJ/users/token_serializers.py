from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT payload to include the user's role.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role 
        
        token['is_admin_user'] = user.is_staff 
        token['is_superuser_user'] = user.is_superuser
        
        return token