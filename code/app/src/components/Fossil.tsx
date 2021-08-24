import React from "react";

const Fossil = (props) => {
    const { fossil } = props;
    return (
        <div>
            <div>
                Name: {fossil.name}; from {fossil.minma} mya to {fossil.maxma} mya. lat: {fossil.lat} lng: {fossil.lng}
            </div>
        </div>
    )
}

export default Fossil;