import React from 'react';
import { Icon } from 'react-materialize';
import { useHistory, Link } from 'react-router-dom';
import { Container, Linha, Titulo } from '../style';
import TradeLocation from '../../../../Components/FieldWork/TradeLocation';
import { CardEvent } from '../../../Events/CardEvent';
import { syncLocationData } from '../tradeGlobalFunctions';
import { getFromStorage } from '../../../../services/auth';

export default function ServiceEvents() {
  const history = useHistory();

  function onUpdateCoord(gpsAvailable, gpsEnabled, coords) {
    const sessao = getFromStorage();
    syncLocationData(sessao.empresaId, sessao.codigoUsuario, coords.latitude, coords.longitude);
  };

  return (
    <>
    <TradeLocation onUpdateCoord={onUpdateCoord} />
      <Titulo
        style={{
          justifyContent: 'flex-start',
          paddingLeft: '15px',
          top: '0px',
          zIndex: '2',
        }}
      >
        <Link
          className="backToStartWorkDay"
          to={{
            pathname: '/ServiceSearchs',
            state: {
              cliente: history?.location?.state?.cliente,
              pesquisas: history?.location?.state?.pesquisas,
            },
          }}
        >
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            className="waves-effect waves-light saib-button is-cancel"
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
        </Link>
        <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Eventos</p>
      </Titulo>
      <Container className="attendanceSearchs" style={{ padding: '5px 8px' }}>
        <Linha style={{ gap: '1rem' }} className="tituloCliente">
          {history?.location?.state?.events &&
            history?.location?.state?.events.map((item) => <CardEvent key={`${item.GEV_ID}`} data={item} pwa={true} />)}
        </Linha>
      </Container>
    </>
  );
}
