import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/DetalleMeta.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DetalleMeta = () => {
  const { idMeta } = useParams();
  const [meta, setMeta] = useState(null);
  const [transaccion, setTransaccion] = useState({
    montoAhorrado: '',
    fechaTransaccion: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://back-flask-6q6j.onrender.com/api/metas/${idMeta}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        setMeta({
          ...response.data,
          MontoAhorrado: parseFloat(response.data.MontoAhorrado) || 0,
        });
      } else {
        console.error('No se encontraron detalles para la meta');
      }
    } catch (error) {
      console.error('Error al obtener la meta', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const faltante = meta.MontoObjetivo - meta.MontoAhorrado;
    if (parseFloat(transaccion.montoAhorrado) > faltante) {
      setError('El monto no puede ser mayor al faltante para concluir la meta.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://back-flask-6q6j.onrender.com/api/metas/${idMeta}/transacciones`,
        transaccion,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setTransaccion({ montoAhorrado: '', fechaTransaccion: '' });
      setError('');
      fetchMeta();
    } catch (error) {
      console.error('Error al registrar la transacción', error);
      setError('Error al registrar la transacción. Por favor, intenta de nuevo.');
    }
  };

  const data = meta
    ? meta.transacciones.map((transaccion) => ({
        fecha: new Date(transaccion.FechaTransaccion).toLocaleDateString(),
        montoAhorrado: parseFloat(transaccion.MontoAhorrado),
        ahorroMensual: parseFloat(meta.AhorroMensual), // Línea constante
      }))
    : [];


  const ahorroMensualData =
    meta &&
    meta.transacciones.map((_, index) => ({
      fecha: data[index]?.fecha || '',
      montoAhorrado: parseFloat(meta.AhorroMensual),
    }));

  const porcentajeCumplimiento = meta
    ? ((meta.MontoAhorrado || 0) / meta.MontoObjetivo) * 100
    : 0;

  const faltanteParaConcluir = meta
    ? meta.MontoObjetivo - meta.MontoAhorrado
    : 0;

  return (
    <div className="detalle-meta-container">
      {meta ? (
        <>
          <h2>{meta.Nombre}</h2>
          <p>
            <strong>Monto Objetivo:</strong>{' '}
            {parseFloat(meta.MontoObjetivo).toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
            })}
          </p>
          <p>
            <strong>Fecha de Inicio:</strong>{' '}
            {new Date(meta.FechaInicio).toLocaleDateString()}
          </p>
          <p>
            <strong>Fecha de Término:</strong>{' '}
            {new Date(meta.FechaTermino).toLocaleDateString()}
          </p>
          <p>
            <strong>Ahorro Mensual:</strong>{' '}
            {parseFloat(meta.AhorroMensual).toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
            })}
          </p>
          <p>
            <strong>Meses para Alcanzar:</strong> {meta.MesesParaMeta}
          </p>
          <p>
            <strong>Monto Ahorrado:</strong>{' '}
            {parseFloat(meta.MontoAhorrado).toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
            })}
          </p>
          <p>
            <strong>Faltante para Concluir Meta:</strong>{' '}
            {parseFloat(faltanteParaConcluir).toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
            })}
          </p>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${porcentajeCumplimiento}%` }}
              ></div>
              <div className="progress-text">
                {porcentajeCumplimiento.toFixed(2)}%
              </div>
            </div>
          </div>

          {porcentajeCumplimiento >= 100 ? (
            <p className="meta-completada">
              ¡Felicidades! Has alcanzado tu meta financiera.
            </p>
          ) : (
            <>
              <h3>Transacciones</h3>
              {meta.transacciones && meta.transacciones.length > 0 ? (
                <table className="transacciones-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meta.transacciones.map((transaccion) => (
                      <tr key={transaccion.ID_Transaccion}>
                        <td>
                          {new Date(
                            transaccion.FechaTransaccion
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {parseFloat(transaccion.MontoAhorrado).toLocaleString(
                            'es-MX',
                            { style: 'currency', currency: 'MXN' }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay transacciones registradas para esta meta.</p>
              )}

              <h3>Registrar Nueva Transacción</h3>
              <form onSubmit={handleSubmit}>
                <div>
                  
                  <input
                    type="number"
                    value={transaccion.montoAhorrado}
                    onChange={(e) =>
                      setTransaccion({
                        ...transaccion,
                        montoAhorrado: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                 
                  <input
                    type="date"
                    value={transaccion.fechaTransaccion}
                    onChange={(e) =>
                      setTransaccion({
                        ...transaccion,
                        fechaTransaccion: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <button type="submit">Registrar Transacción</button>
              </form>
              {error && <p className="error-message">{error}</p>}
            </>
          )}

<h3>Progreso de Ahorro</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="montoAhorrado" stroke="#8884d8" name="Monto Ahorrado" />
              <Line type="monotone" dataKey="ahorroMensual" stroke="#82ca9d" name="Ahorro Mensual Constante" />
            </LineChart>
          </ResponsiveContainer>

          <button onClick={() => navigate('/dashboard/metas-financieras')}>
            Volver a Mis Metas
          </button>
        </>
      ) : (
        <p>Cargando detalles de la meta...</p>
      )}
    </div>
  );
};

export default DetalleMeta;
