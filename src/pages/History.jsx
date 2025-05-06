import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Timeline from './Timeline';
import './History.css';

const History = () => {
  const [isIntersecting, setIsIntersecting] = useState({
    vision: false,
    values: false,
    timeline: false,
    commitment: false
  });
  const sectionsRef = useRef({});

  useEffect(() => {
    const observerOptions = {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.15
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsIntersecting(prev => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = {
      vision: document.querySelector('.vision-mission-container'),
      values: document.querySelector('.values-grid-section'),
      timeline: document.querySelector('.timeline-section'),
      commitment: document.querySelector('.history-commitment-section')
    };
    
    // Store refs for cleanup
    sectionsRef.current = sections;
    
    // Set data attributes and observe
    Object.entries(sections).forEach(([key, section]) => {
      if (section) {
        section.dataset.section = key;
        observer.observe(section);
      }
    });
    
    return () => {
      // Cleanup observer
      Object.values(sectionsRef.current).forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="history">
      {/* Hero Header Section */}
      <div className="history-hero">
        <div className="container">
          <h1>Nuestra Historia</h1>
          <div className="history-hero-content">
            <p className="history-intro">
              Desde 2011, el Centro de Especialidades Médicas Dr. Marco V. Mullo ha estado comprometido con brindar atención médica de excelencia a nuestra comunidad. 
              Nuestra trayectoria está marcada por un constante compromiso con la innovación, la calidad y el cuidado centrado en el paciente.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={`vision-mission-container ${isIntersecting.vision ? 'animate-in' : ''}`} data-section="vision">
          <div className="vision card">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h2>Nuestra Visión</h2>
            <p>Ser el centro médico líder en la región, reconocido por la calidad de nuestra atención, la competencia de nuestros profesionales y el uso innovador de tecnología avanzada. Aspiramos a crear un ambiente donde la comodidad y el bienestar de nuestros pacientes sean una prioridad, promoviendo un cuidado personalizado y accesible que responda a las necesidades de salud de nuestra comunidad. Buscamos ser pioneros en la integración de avances médicos y tecnológicos, manteniendo siempre un enfoque humano y centrado en el paciente.</p>
          </div>
          <div className="mission card">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Nuestra Misión</h2>
            <p>Nuestra misión es proporcionar atención médica de excelencia a través de un equipo de profesionales altamente especializados y comprometidos con la salud de nuestros pacientes. Contamos con tecnología de última generación y una infraestructura moderna y acogedora para asegurar una experiencia de cuidado integral y confortable. Nuestro objetivo es mejorar la calidad de vida de las personas, ofreciendo diagnósticos precisos, tratamientos efectivos y un entorno donde cada paciente se sienta valorado y bien atendido.</p>
          </div>
        </div>

        <div className={`values-grid-section ${isIntersecting.values ? 'animate-in' : ''}`} data-section="values">
          <h2 className="values-title">Nuestros Servicios</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h3>Medicina General</h3>
              <p>Atención médica integral para el diagnóstico y tratamiento de diversas condiciones de salud.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3>Odontología</h3>
              <p>Servicios dentales completos incluyendo endodoncia, ortodoncia y diseño de sonrisa.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m8 14 2.5-2.5M14 8l2.5 2.5M14 16l2.5-2.5M8 8l2.5 2.5"></path>
                </svg>
              </div>
              <h3>Especialistas</h3>
              <p>Contamos con especialistas en pediatría, obstetricia, traumatología y más áreas médicas.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                </svg>
              </div>
              <h3>Servicios Complementarios</h3>
              <p>Laboratorio clínico, imagenología, rehabilitación física, vacunatorio y farmacia.</p>
            </div>
          </div>
        </div>

        {/* Simple gradient transition */}
        {/* <div className="section-transition"></div> */}
      </div>

      <div className={`timeline-section ${isIntersecting.timeline ? 'animate-in' : ''}`} data-section="timeline">
        <div className="container timeline-header-container">
          <h2 className="section-title">Nuestra Historia</h2>
          <p className="section-subtitle">
            El camino que hemos recorrido desde nuestra fundación
          </p>
        </div>
        <div className="timeline-wrapper">
          <Timeline />
        </div>
      </div>

      <div className={`history-commitment-section ${isIntersecting.commitment ? 'animate-in' : ''}`} data-section="commitment">
        <div className="container">
          <div className="history-commitment">
            <h2>Nuestro compromiso con la comunidad</h2>
            <p>
              En el Centro de Especialidades Médicas Dr. Marco V. Mullo, mantenemos un firme compromiso con la salud y el bienestar de nuestra comunidad. 
              Nuestra labor va más allá de las paredes de nuestro centro, buscando siempre brindar servicios accesibles y de calidad para todos.
            </p>
            <p>
              Nuestro equipo de profesionales médicos, enfermeros y personal administrativo trabaja incansablemente
              para proporcionar la mejor atención posible, manteniéndonos fieles a nuestra misión de mejorar la calidad de vida de nuestros pacientes.
            </p>
            <a href="https://wa.me/593967758178?text=Hola%2C%20quisiera%20contactarles" className="btn btn-primary commitment-cta" target="_blank" rel="noopener noreferrer">Contáctanos</a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default History; 