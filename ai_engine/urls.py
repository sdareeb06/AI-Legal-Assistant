from django.urls import path
from . import views

urlpatterns = [
    # Yahan humne dono raaste khol diye hain taake koi bhi error na aaye
    path('analyze-fir/', views.analyze_fir, name='analyze_fir'),
    path('upload-fir/', views.analyze_fir, name='upload_fir'),  # <--- YEH LINE ADD KI HAI
    
    path('chat/', views.chat_query, name='chat_query'),
    
    # Auth Endpoints
    path('register-db/', views.register_user_db, name='register_db'),
    path('login-db/', views.login_user_db, name='login_db'),
    path('activate/<uidb64>/<token>/', views.activate_account, name='activate'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
]