function toggleCollapse(header) {
  let cardBody = header.nextElementSibling; // Get the next sibling, which is .card-body

  if (cardBody.style.maxHeight && cardBody.style.maxHeight !== "0px") {
      cardBody.style.maxHeight = "0";
      cardBody.style.padding = "0 15px"; // Remove padding when collapsing
  } else {
      let fullHeight = cardBody.scrollHeight + 20; // Add small buffer
      cardBody.style.maxHeight = fullHeight + "px";
      cardBody.style.padding = "15px";
  }
}
