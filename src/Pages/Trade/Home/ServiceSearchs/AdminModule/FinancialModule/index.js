import React, { useEffect, useMemo, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Icon } from 'react-materialize';
import { Titulo } from '../style';
import { BillContainer, FinancialButton } from './style';
import { FaStopwatch } from 'react-icons/fa';
import api from '../../../../../../services/api';
import { currencyFormat, formataMoedaPFloat } from '../../../../../../services/funcoes';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getFromStorage } from '../../../../../../services/auth';

const FinancialModule = (props) => {
  const [typeFilter, setTypeFilter] = useState(1);
  const [contasVencidas, setContasVencidas] = useState([]);
  const [contasAReceber, setContasAReceber] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalValueDueDate = contasVencidas.reduce(
    (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.FIN_VALOR),
    0
  );

  const totalValueToReceive = contasAReceber.reduce(
    (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.FIN_VALOR),
    0
  );

  const handleGetData = async (id) => {
    try {
      const sessao = getFromStorage();

      setLoading(true);
      const res = await api.get(`v1/trade/admin/financial/${sessao.empresaId}/${sessao.codigoUsuario}`, {
        params: {
          cliente_id: id,
        },
      });

      const { data, sucess } = res.data;

      if (sucess) {
        const hoje = new Date();

        let contasVencidas = [];
        let contasAReceber = [];

        data.forEach((conta) => {
          const dataVencimento = new Date(conta.FIN_DATA_VCTO);
          if (dataVencimento < hoje) {
            contasVencidas.push(conta);
          } else {
            contasAReceber.push(conta);
          }
        });

        contasVencidas = contasVencidas.sort((a, b) => {
          return new Date(a.FIN_DATA_VCTO) < new Date(b.FIN_DATA_VCTO) ? -1 : 0;
        });

        contasAReceber = contasAReceber.sort((a, b) => {
          return new Date(a.FIN_DATA_VCTO) < new Date(b.FIN_DATA_VCTO) ? -1 : 0;
        });

        setContasVencidas(contasVencidas);
        setContasAReceber(contasAReceber);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = useMemo(() => {
    let items = [];

    if (typeFilter === 1) {
      items = contasVencidas;
    } else {
      items = contasAReceber;
    }

    const grouped = {};

    items.forEach((item) => {
      const date = new Date(item.FIN_DATA_VCTO);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${(day + 1).toString().padStart(2, '0')}`;
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(item);
    });

    return grouped;
  }, [contasVencidas, contasAReceber, typeFilter]);

  useEffect(() => {
    const { cliente } = props.history.location.state;
    async function startLoad() {
      await handleGetData(cliente.CLI_ID);
    }
    startLoad();
  }, [props.history.location.state]);

  return (
    <>
      <WaitScreen loading={loading} />
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
            pathname: '/AdminModule',
            state: {
              cliente: props.history.location.state.cliente,
              pesquisas: props.history.location.state.pesquisas,
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
        <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Financeiro</p>
      </Titulo>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '10px',
          marginTop: '10px',
          justifyContent: 'space-around',
        }}
      >
        <FinancialButton typeFilter={typeFilter === 1} onClick={() => setTypeFilter(1)}>
          <FaStopwatch size={30} />
          <p>Vencidos</p>
          <p>{currencyFormat(totalValueDueDate)}</p>
        </FinancialButton>
        <FinancialButton typeFilter={typeFilter === 2} onClick={() => setTypeFilter(2)}>
          <FaStopwatch size={30} />
          <p>A receber</p>
          <p>{currencyFormat(totalValueToReceive)}</p>
        </FinancialButton>
      </div>
      <div
        style={{
          padding: '5px',
          borderTop: '1px solid #C4C4C4',
          marginTop: '10px',
          paddingTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {Object.values(groupByDay).length === 0 && (
          <p style={{ fontSize: '16px', color: '#000', fontWeight: 700 }}>Nenhum registro encontrado</p>
        )}

        {Object.values(groupByDay).map((conta, key) => (
          <div
            key={key}
            style={{ marginBottom: '10px', borderBottom: '1px solid #C4C4C4', paddingBottom: '10px', width: '98%' }}
          >
            <p style={{ fontSize: '18px', color: '#6D6D6D', fontWeight: 700 }}>
              {format(new Date(conta[0].FIN_DATA_VCTO), "dd 'de' MMMM yyyy", {
                locale: ptBR,
              })}
            </p>
            {conta.length === 0 && (
              <p style={{ fontSize: '18px', color: '#6D6D6D', fontWeight: 700 }}>Nenhum registro encontrado</p>
            )}

            {conta.length > 0 && (
              <div style={{ borderLeft: '1px solid #C4C4C4', marginLeft: '5px', width: '100%', marginTop: '-0.2rem' }}>
                {conta.map((cnt, index) => {
                  return (
                    <BillContainer
                      key={cnt.FIN_ID}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        borderBottom: cnt.length > 1 && cnt.length !== index + 1 ? '1px solid #C4C4C4' : '',
                        padding: '5px',
                        color: typeFilter === 1 ? '#ED3241' : '#000',
                        fontSize: '14px',
                        fontWeight: 600,
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <p style={{ fontSize: '16px', fontWeight: 700 }}>{currencyFormat(cnt.FIN_VALOR)}</p>
                        <p>{cnt.FIN_TIPO_DOCUMENTO}</p>
                      </div>
                      <p>Nr. Doc: {cnt.FIN_NUMERO_DOCUMENTO}</p>
                      <p>{cnt.Observacao}</p>
                    </BillContainer>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default withRouter(FinancialModule);
