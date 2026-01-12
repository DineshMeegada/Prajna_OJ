from rest_framework import serializers
from .models import User, MasterAccessRequest
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class MasterRequestSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = MasterAccessRequest
        fields = ['id', 'user', 'status', 'request_reason', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        
        # 1. Rule: Already a Master/Admin?
        if user.role in [User.Roles.MASTER, User.Roles.ADMIN]:
            raise serializers.ValidationError("You are already a Master or Admin.")

        # 2. Rule: Once a Month
        one_month_ago = timezone.now() - relativedelta(months=1)
        recent_requests = MasterAccessRequest.objects.filter(
            user=user, 
            created_at__gte=one_month_ago
        )
        if recent_requests.exists():
            raise serializers.ValidationError("You can only request Master access once per month.")
            
        return data

class AdminActionSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT', 'HOLD'])

class GoogleLoginSerializer(serializers.Serializer):
    # This serializer validates the token received from frontend
    access_token = serializers.CharField(allow_blank=False)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pk', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['email', 'role'] # Role should probably be read-only for normal profile updates