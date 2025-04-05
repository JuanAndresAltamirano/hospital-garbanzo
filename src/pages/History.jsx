import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Timeline from './Timeline';
import './History.css';

const History = () => {
  return (
    <div className="history">
      <div className="container">
        {/*
        <h1>Nuestra Historia</h1>
        <p className="history-intro">
          Desde nuestros humildes inicios hasta la actualidad, Clínica Mullo ha estado comprometida con la salud y el bienestar de nuestra comunidad.
        </p>
        */}

<section className="vision-mission">
          <div className="vision">
            <h2>Nuestra Visión</h2>
            <p>Ser la institución de salud líder en nuestra región, reconocida por la excelencia en el cuidado del paciente y la innovación médica.</p>
          </div>
          <div className="mission">
            <h2>Nuestra Misión</h2>
            <p>Proporcionar atención médica de la más alta calidad, centrada en el paciente, con compasión y compromiso con la comunidad.</p>
          </div>
        </section>

        <Timeline />

        
      </div>
    </div>
  );
};

export default History; 