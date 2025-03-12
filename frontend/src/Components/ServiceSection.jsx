import React from 'react';
import '../CSS/ServiceSection.css';
import { ArrowRight } from 'react-feather';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: 'Register For Event',
      icon: (
        <svg className="service-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h10V4H7zm3 7h4v2h-4v-2zm0-4h4v2h-4V7zm0 8h2v2h-2v-2z"/>
          <path d="M12 8v4h-2V8h2zm0 0v4h2V8h-2z"/>
        </svg>
      ),
      description: 'orem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et...',
      link: '/register-event'
    },
    {
      id: 2,
      title: 'Book Pandits',
      icon: (
        <svg className="service-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
        </svg>
      ),
      description: 'orem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et...',
      link: '/book-pandits'
    },
    {
      id: 3,
      title: 'Rent Clothes',
      icon: (
        <svg className="service-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4C9.8 4 8 5.8 8 8h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.2-1.8-4-4-4z"/>
          <path d="M18 8c0 1.1-1.9 5-1.9 5l-2.1-2v8c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-8l-2.1 2C7.9 13 6 9.1 6 8c0-3.3 2.7-6 6-6s6 2.7 6 6z"/>
        </svg>
      ),
      description: 'orem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et...',
      link: '/rent-traditionals'
    }
  ];
  
  return (
    <section className="services-section">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">Our Services</h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            What do we offer
          </p>
        </div>
        
        <div className="row g-4">
          {services.map((service) => (
            <div key={service.id} className="col-md-4">
              <div className="service-card">
                <div className="icon-wrapper">
                  {service.icon}
                </div>
                <h3 className="card-title">{service.title}</h3>
                <p className="card-description">{service.description}</p>
                <a href={service.link} className="find-out-more">
                  Find out more <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;