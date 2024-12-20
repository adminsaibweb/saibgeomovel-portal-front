export default [
  {
    featureType: "water",
    elementType: "geometry",
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        visibility: "off"
      },
      {
        weight: 0.9
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        visibility: "on"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "simplified"
      }
    ]
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  }
];
