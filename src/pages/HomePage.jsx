import React from 'react';
import FlightSearchForm from '../components/FlightSearchForm';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700">
      {/* Hero Section */}
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="text-white">
                <h1 className="text-5xl font-bold leading-tight mb-4">
                  Book Flights
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form Section */}
      <div className="relative -mt-20 pb-20">
        <div className="container mx-auto px-4">
          <FlightSearchForm className="max-w-5xl mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
