import React, { useState } from 'react';
import { Button, Icon } from 'react-materialize';
import { Container, Labels, Linha } from './styled';
import api from '../../services/api';
import { alerta } from '../../services/funcoes';
import DirectTituloJanela from '../../Components/Globals/DirectTituloJanela';
import Header from '../../Components/System/Header';
import { useHistory } from 'react-router-dom';
import { IoIosAddCircle, IoMdSearch } from 'react-icons/io';
import WaitScreen from '../../Components/Globals/WaitScreen';
import SelectQuery from '../../Components/Globals/SelectQuery';
import { getFromStorage } from '../../services/auth';
import { CardEvent } from './CardEvent';

export default function PDVEvents() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSelect, setCustomerSelect] = useState(null);
  const [dataTable, setDataTable] = useState([]);

  const history = useHistory();

  async function getData() {
    try {
      setLoading(true);
      const res = await api.get(`v1/pdv/events`, {
        params: {
          GEV_CLI_ID: customerSelect?.CLI_ID,
        },
      });

      const { data } = res.data;

      if (data && data.length > 0) {
        setDataTable(data);
      } else {
        alerta("Nenhum dado para ser exibido")
      }
    } catch (error) {
      alerta('Erro ao buscar os dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent(id) {
    try {
      setLoading(true);
      const res = await api.delete(`v1/pdv/events/${id}`);

      const { sucess } = res.data;

      if (sucess) {
        setDataTable(dataTable.filter((e) => e.GEV_ID !== id));
        alerta('Evento excluído com sucesso', 1);
      }
    } catch (error) {
      alerta('Não foi possível excluir o evento', 2);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterCustomers(text) {
    try {
      setLoading(true);
      const sessao = getFromStorage();

      let url = `v1/schedule/clientes/${sessao.empresaId}/${sessao.codigoUsuario}`;
      const dataToSend = {
        filtro: String(text),
      };

      const retorno = await api.post(url, dataToSend);
      const { sucess, data } = retorno.data;

      if (sucess && data) {
        setCustomers(data);
      }
    } catch (err) {
      alerta('Erro ao carregar os clientes =>' + err, 2);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <WaitScreen loading={loading} />
      <Header />
      <Container>
        <DirectTituloJanela
          urlVoltar={'/home'}
          titulo={
            loading ? (
              'Aguarde...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>event_note</Icon>Eventos
              </span>
            )
          }
        />
        <Linha style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.5rem', marginTop: "0.5rem", gap: '0.5rem' }}>
            <Labels>Cliente</Labels>
            <SelectQuery
              onChangeComponentIsExternal
              loading={false}
              colorPrimary
              query={customers}
              keys={['CLI_ID', 'CLI_NOME_FANTASIA']}
              label="CLI_NOME_FANTASIA"
              onChange={async (text) => {
                await handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
              }}
              onSelect={(item) => {
                setCustomerSelect(item);
              }}
              onDelete={() => {
                setCustomerSelect(null);
              }}
            />

        </Linha>

        <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: "1rem" }}>
          <Button className="waves-effect waves-light saib-button is-primary" onClick={getData}>
            <IoMdSearch size={20} />
            Buscar dados
          </Button>
          <Button
            className="waves-effect waves-light saib-button is-primary"
            onClick={() => {
              history.push('/AddEvent');
            }}
          >
            <IoIosAddCircle size={20} />
            Adicionar evento
          </Button>
        </div>

        {dataTable && dataTable.length === 0 &&
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", borderTop: "1px solid #e6e6e6", paddingTop: "0.5rem", marginTop: "2rem" }}>
            <span>Nenhum dado para ser exibido!</span>
          </div>
        }

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            width: '100%',
            padding: '0.5rem 1rem',
          }}
        >
          {dataTable.map((item) => (
            <CardEvent key={`${item.GEV_ID}`} data={item} handleDeleteEvent={(id) => handleDeleteEvent(id)} pwa={false} />
          ))}
        </div>
      </Container>
    </>
  );
}
