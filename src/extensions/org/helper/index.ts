
// Function to create and show a popup notification 
export function showPopupNotification(message: string) { // Create the popup container 
    const popupContainer = document.createElement("div");
    popupContainer.style.position = "fixed";
    popupContainer.style.bottom = "20px";
    popupContainer.style.right = "20px";
    popupContainer.style.padding = "15px";
    popupContainer.style.backgroundColor = "#333";
    popupContainer.style.color = "#fff";
    popupContainer.style.borderRadius = "5px";
    popupContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    popupContainer.style.zIndex = "1000";
    popupContainer.style.maxWidth = "300px";
    popupContainer.style.fontFamily = "Arial, sans-serif";
    // Create the message element 
    const messageElement = document.createElement("p");
    messageElement.style.margin = "0";
    messageElement.style.marginRight = "8px";
    messageElement.style.fontSize = "14px";
    messageElement.style.lineHeight = "1.5";
    messageElement.textContent = message;
    // Append the message to the popup container 
    popupContainer.appendChild(messageElement); // Create the close button 
    const closeButton = document.createElement("span");
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontWeight = "bold";
    closeButton.style.fontSize = "16px";
    closeButton.textContent = "×";
    closeButton.onclick = function () {
        document.body.removeChild(popupContainer);
    }; // Append the close button to the popup container 
    popupContainer.appendChild(closeButton); // Append the popup container to the body 
    document.body.appendChild(popupContainer); // Automatically hide the popup after 5 seconds 
    setTimeout(() => {
        if (document.body.contains(popupContainer)) {
            document.body.removeChild(popupContainer);
        }
    }, 5000);
}
