// SimpleModal.js
import React from 'react';

const determineExpiryStyle = (expiryDate) => {
    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = Math.abs(expiry - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 90 ? 'text-red-500' :
        diffDays <= 365 ? 'text-red-300' :
            'text-green-500';
};

const determinePriceStyle = (price) => {
    return price === 0 ? 'text-red-500' : 'text-green-500';
};

const SimpleModal = ({ isOpen, onClose, onConfirm, items }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 my-8 overflow-auto">
                <h2 className="text-center text-2xl font-semibold mb-4">Confirm Items</h2>
                <ul className="list-none w-full">
                    {items.map((item, index) => (
                        <li key={index} className="mb-2 flex flex-col sm:flex-row justify-center items-center text-center">
                            <span className="sm:mr-2">{item.productName} - Quantity: {item.quantity} {item.measurement} -</span>
                            <span className={`sm:mr-2 ${determinePriceStyle(item.price)}`}> Price: {item.price} / {item.price.toString() === '0' ? item.price: item.price/item.quantity}</span>
                            <span>- Expires at: <span className={determineExpiryStyle(item.expiryDate)}>{item.expiryDate}</span></span>
                        </li>

                    ))}
                </ul>
                <div className="flex justify-center mt-6">
                    <button onClick={onConfirm} className="bg-green-500 text-white px-6 py-2 rounded-md mr-4 hover:bg-green-600">Confirm</button>
                    <button onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default SimpleModal;
