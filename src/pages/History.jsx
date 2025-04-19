import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Timeline from './Timeline';
import './History.css';

const History = () => {
  return (
    <div className="history">
      <div className="container">
        <div className="history-header">
          <h1>Nuestra Historia</h1>
          <p className="history-intro">
            Desde 1982, Clínica Mullo ha estado comprometida con brindar atención médica de excelencia a nuestra comunidad. 
            Nuestra trayectoria está marcada por un constante compromiso con la innovación, la calidad y el cuidado centrado en el paciente.
          </p>
        </div>

        <div className="values-section">
          <div className="vision-mission-container">
            <div className="vision card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h2>Nuestra Visión</h2>
              <p>Ser la institución médica de referencia en Ecuador, reconocida por la excelencia clínica, la investigación médica avanzada y el cuidado humanizado, mejorando la calidad de vida de nuestros pacientes y comunidad.</p>
            </div>
            <div className="mission card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Nuestra Misión</h2>
              <p>Proporcionar atención médica integral y personalizada de la más alta calidad, con compasión y ética profesional, utilizando tecnología de vanguardia y personal altamente calificado para garantizar los mejores resultados médicos.</p>
            </div>
          </div>
        </div>

        <div className="values-grid-section">
          <h2 className="values-title">Nuestros Valores</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h3>Compasión</h3>
              <p>Brindamos atención con empatía y sensibilidad, reconociendo la dignidad de cada paciente.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3>Integridad</h3>
              <p>Actuamos con honestidad, transparencia y ética profesional en todo momento.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m8 14 2.5-2.5M14 8l2.5 2.5M14 16l2.5-2.5M8 8l2.5 2.5"></path>
                </svg>
              </div>
              <h3>Innovación</h3>
              <p>Buscamos constantemente nuevas formas de mejorar nuestros servicios y procesos médicos.</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                </svg>
              </div>
              <h3>Comunicación</h3>
              <p>Mantenemos un diálogo abierto y claro con nuestros pacientes y sus familias.</p>
            </div>
          </div>
        </div>

        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div className="divider-line"></div>
        </div>

        <div className="timeline-section">
          <h2 className="section-title">Nuestra Trayectoria</h2>
          <p className="section-subtitle">
            Un recorrido por los momentos más importantes que han marcado nuestra evolución como institución médica de excelencia
          </p>
          <div className="timeline-wrapper">
            <Timeline />
          </div>
        </div>

        <div className="history-commitment">
          <h2>Nuestro compromiso con la comunidad</h2>
          <p>
            A lo largo de nuestra historia, hemos mantenido un firme compromiso con la salud y el bienestar de nuestra comunidad. 
            Creemos que nuestra labor va más allá de las paredes de nuestra clínica, promoviendo programas de prevención,
            educación sanitaria y apoyo a poblaciones vulnerables.
          </p>
          <p>
            Nuestro equipo de profesionales médicos, enfermeros y personal administrativo trabaja incansablemente
            para proporcionar la mejor atención posible, manteniéndonos fieles a nuestros valores y misión.
          </p>
        </div>
      </div>
    </div>
  );
};

export default History; 