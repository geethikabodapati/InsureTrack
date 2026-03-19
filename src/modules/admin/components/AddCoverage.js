// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { addCoverage } from '../../../services/api'; // Adjust path to your api.js

// const AddCoverage = () => {
//     const { productId } = useParams();
//     const navigate = useNavigate();
//     const [coverageData, setCoverageData] = useState({
//         name: '',
//         description: '',
//         limit: ''
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await addCoverage(productId, coverageData);
//             alert('Coverage added successfully!');
//             navigate('/admin-products');
//         } catch (error) {
//             console.error("Error adding coverage:", error);
//             alert('Failed to add coverage.');
//         }
//     };

//     return (
//         <div className="p-6">
//             <h2>Add New Coverage for Product ID: {productId}</h2>
//             <form onSubmit={handleSubmit}>
//                 {/* Add your input fields here */}
//                 <input 
//                     type="text" 
//                     placeholder="Coverage Name" 
//                     onChange={(e) => setCoverageData({...coverageData, name: e.target.value})} 
//                 />
//                 <button type="submit" className="bg-blue-600 text-white p-2">Save Coverage</button>
//             </form>
//         </div>
//     );
// };

// export default AddCoverage;