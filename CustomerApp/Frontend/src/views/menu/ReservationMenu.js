import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import axios from 'axios';

function MenuReservationApp() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Axios call on page load
    axios.post('https://3ithnk2mg5.execute-api.us-east-1.amazonaws.com/dev/get-menu', {"restaurant_id": "1"})
      .then(response => {
        // Assuming the response data is an array of menu items
        setMenuItems(response.data.body.restaurant_food_menu);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
      });
  }, []); // The empty dependency array ensures that this effect runs only once on mount

  const isEntireMenuOffer = menuItems.length > 0 && menuItems[0].menu_offer !== undefined;

  const getNonSlashedPrice = (item) => {
    if (isEntireMenuOffer) {
      return item.menu_price; // Display regular price when there's an entire menu offer
    } else {
      const offer = Number(item.menu_offer);
      const discount = Number.isNaN(offer) ? 0 : offer; // Ensure offer is a valid number

      return item.menu_offer
        ? item.menu_price - (item.menu_price * (discount / 100))
        : item.menu_price; // Display regular price when there's no offer for the item
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    // Ensure newQuantity is a valid number and greater than or equal to 0
    newQuantity = Number.isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity;

    setMenuItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      return updatedItems;
    });
  };

  const handleAddToCart = () => {
    const selectedItems = menuItems.filter((item) => item.quantity > 0);
    console.log('Selected items:', selectedItems);
    // Implement your logic to submit the reservation here

    // Reset quantities after submitting
    setMenuItems((prevItems) =>
      prevItems.map((item) => ({ ...item, quantity: 0 }))
    );
  };

  // Group menu items by category
  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <Container className="mt-5">
      <h1 className="text-center">Restaurant Menu</h1>
      {isEntireMenuOffer && (
        <div className="text-center">
          <h3>Special Offer: 20% off on the entire menu!</h3>
        </div>
      )}
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-center">{category}</h2>
          <Grid container spacing={3}>
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <Grid key={item.id} item xs={12} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      alt={item.menu_category}
                      height="140"
                      image={item.menu_image} 
                    />
                    <CardContent>
                      <h5>{item.menu_category}</h5>
                      {isEntireMenuOffer && (
                        <>
                          <p style={{ textDecoration: 'line-through', color: 'gray' }}>
                            ${item.menu_price}
                          </p>
                          <p style={{ fontWeight: 'bold', color: 'red' }}>
                            ${getNonSlashedPrice(item)}
                          </p>
                        </>
                      )}
                      {!isEntireMenuOffer && <p>${item.menu_price}</p>}
                      <p>Ingredients: {item.menu_ingrediants}</p>
                      <p>Discount: {item.menu_offer}</p>
                      <p>Availability: {item.menu_item_availability}</p>
                      <div className="text-center">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </div>
      ))}
      <div className="text-center mt-4">
        <Button variant="contained" color="primary" size="large" onClick={handleAddToCart}>
          Submit Reservation
        </Button>
      </div>
    </Container>
  );
}

export default MenuReservationApp;

