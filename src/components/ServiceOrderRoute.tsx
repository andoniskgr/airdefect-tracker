
import { Route } from "react-router-dom";
import ServiceOrder from "../pages/ServiceOrder";

const ServiceOrderRoute = () => {
  return <Route path="/service-order" element={<ServiceOrder />} />;
};

export default ServiceOrderRoute;
