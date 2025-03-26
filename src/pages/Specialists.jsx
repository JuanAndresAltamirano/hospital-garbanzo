import './Specialists.css';

const Specialists = () => {
  const specialists = [
    {
      name: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      description: 'Especialista en medicina familiar con más de 15 años de experiencia.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80'
    },
    {
      name: 'Dra. María González',
      specialty: 'Pediatría',
      description: 'Dedicada al cuidado integral de niños y adolescentes.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80'
    },
    {
      name: 'Dr. Carlos Rodríguez',
      specialty: 'Ginecología',
      description: 'Especialista en salud femenina y cuidado prenatal.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80'
    },
    {
      name: 'Dra. Ana Martínez',
      specialty: 'Cardiología',
      description: 'Experta en diagnóstico y tratamiento de enfermedades cardíacas.',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="specialists">
      <div className="container">
        <h1>Nuestros Especialistas</h1>
        <p className="specialists-intro">
          Contamos con un equipo de profesionales altamente calificados y comprometidos con su salud.
        </p>

        <div className="specialists-grid">
          {specialists.map((specialist, index) => (
            <div key={index} className="specialist-card">
              <div className="specialist-image">
                <img src={specialist.image} alt={specialist.name} />
              </div>
              <div className="specialist-content">
                <h3>{specialist.name}</h3>
                <h4>{specialist.specialty}</h4>
                <p>{specialist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Specialists; 