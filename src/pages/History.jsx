import './History.css';

const History = () => {
  const timeline = [
    {
      year: '1995',
      title: 'Fundación',
      description: 'Clínica Mullo abre sus puertas como una pequeña clínica familiar.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80'
    },
    {
      year: '2005',
      title: 'Expansión',
      description: 'Ampliación de instalaciones y servicios para mejor atención a nuestros pacientes.',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80'
    },
    {
      year: '2015',
      title: 'Modernización',
      description: 'Incorporación de tecnología de última generación y nuevos especialistas.',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80'
    },
    {
      year: 'Actualidad',
      title: 'Excelencia en Salud',
      description: 'Reconocidos por nuestra calidad en atención y servicio a la comunidad.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="history">
      <div className="container">
        <h1>Nuestra Historia</h1>
        <p className="history-intro">
          Desde nuestros humildes inicios hasta la actualidad, Clínica Mullo ha estado comprometida con la salud y el bienestar de nuestra comunidad.
        </p>

        <div className="timeline">
          {timeline.map((item, index) => (
            <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-content">
                <div className="timeline-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="timeline-text">
                  <span className="year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

export default History; 