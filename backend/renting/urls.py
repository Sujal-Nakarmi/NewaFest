from django.urls import path
from . import views

urlpatterns = [
    # Rental Items URLs
    path('renting/rental-items/', views.list_rental_items, name='list_rental_items'),
    path('renting/rental-items/create/', views.create_rental_item, name='create_rental_item'),
    path('renting/rental-items/<int:item_id>/', views.get_rental_item, name='get_rental_item'),
    path('renting/rental-items/<int:item_id>/update/', views.update_rental_item, name='update_rental_item'),
    path('renting/rental-items/<int:item_id>/delete/', views.delete_rental_item, name='delete_rental_item'),
    path('renting/public/rental-items/', views.public_list_rental_items, name='public_list_rental_items'),
    
    # Size Variant URLs - renamed from sizes to size-variants for clarity
    path('renting/rental-items/<int:item_id>/size-variants/', views.add_size_variant, name='add_size_variant'),
    path('renting/rental-items/<int:item_id>/size-variants/all/', views.list_size_variants, name='list_size_variants'),
    path('renting/rental-items/<int:item_id>/size-variants/<int:variant_id>/', views.update_size_variant, name='update_size_variant'),
    path('renting/rental-items/<int:item_id>/size-variants/<int:variant_id>/delete/', views.delete_size_variant, name='delete_size_variant'),

     # Cart endpoints
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/', views.get_cart, name='get-cart'),
    path('cart/items/<int:cart_item_id>/', views.update_cart_item, name='update-cart-item'),
    path('cart/items/<int:cart_item_id>/remove/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),

    path('delivery/provinces/', views.list_provinces, name='list_provinces'),
    path('delivery/provinces/<str:province>/metro-areas/', views.list_metro_areas, name='list_metro_areas'),
    path('delivery/provinces/<str:province>/metro-areas/<str:metro_area>/areas/', views.list_areas, name='list_areas'),
    path('delivery/provinces/<str:province>/areas/', views.list_areas, name='list_areas_by_province'),
    path('cart/update-delivery-location/', views.update_cart_delivery_location, name='update_cart_delivery_location'),
    path('delivery/locations/', views.list_all_delivery_locations, name='list_all_delivery_locations'),


    path('api/initiate-payment/', views.initiate_payment, name='initiate_payment'),
    path('api/verify-payment/', views.verify_payment, name='verify_payment'),


    path('orders/history/', views.order_history, name='order-history'),
]




