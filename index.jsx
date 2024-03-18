import React, { useState } from 'react';

const ImageDropdown = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.value);
  };

  const handleShowSelectedImage = () => {
    alert(`Selected Image: ${selectedImage}`);
  };

  return (
    <div>
      <label htmlFor="imageSelect">Select an Image:</label>
      <select id="imageSelect" value={selectedImage} onChange={handleImageChange}>
        {images.map((imageUrl, index) => (
          <option key={index} value={imageUrl}>
            {index + 1}. Image
          </option>
        ))}
      </select>
      <div>
        <img
          src={selectedImage}
          alt="Selected Image"
          style={{ width: '300px', height: '200px', marginTop: '10px' }}
        />
      </div>
      <button onClick={handleShowSelectedImage}>Show Selected Image</button>
    </div>
  );
};

const images = [
  'https://bright_outdoor.odoads.com/media/bright_outdoor/media/images/image_2603179.jpeg',
  'https://woohooads.odoads.com/media/woohooads/media/images/InternationalBusinessCenterPiplodOutdoor.jpg',
  'https://woohooads.odoads.com/media/woohooads/media/images/OppKKVHallRajkot.jpg',
  // Add more image URLs as needed
];

const App = () => {
  return (
    <div>
      <h1>Image Dropdown Example</h1>
      <ImageDropdown images={images} />
    </div>
  );
};

export default App;

