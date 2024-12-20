import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Button, Icon } from 'react-materialize';
import { handleGetDataInventory, handleGetSales } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { Container } from '../Conference/style';
import { FormataValorMonetario, alerta, formatOracleDateToBr, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';

class Order extends Component {
  state = {
    cliente: undefined,
    pesquisas: undefined,
    loading: false,
    searchTerm: '',
    products: [],
    orders: [],
    inProgress: [],
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, order } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let inventory = scheduleData.CONFERENCE;
    let inProgress = scheduleData.ORDERS;
    if (inventory) {
      inventory = scheduleData.CONFERENCE.INVENTORY;
    }

    if (inProgress) {
      inProgress = scheduleData.ORDERS.INPROGRESS;
    }

    if (!inventory || inventory.length === 0) {
      const sessao = getFromStorage();
      this.setState({
        loading: true,
      });
      inventory = await handleGetDataInventory(sessao.empresaId, sessao.codigoUsuario, cliente.CLI_ID);
    }

    if (!inventory) {
      alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
      this.setState({
        loading: false,
      });
      this.props.history.push({
        pathname: '/AdminModule',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
      return;
    }

    if (order) {
      this.setState({
        order,
      });
    }

    this.setState({
      cliente: cliente,
      pesquisas: pesquisas,
      inProgress,
      loading: false,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleEditOrder = async (item, index) => {
    const { empresaAtiva, usuarioAtivo, cliente, pesquisas, inProgress } = this.state;
    const scheduleData = await getScheduleData()
    this.setState({ loading: true });
    const res = await handleGetSales(empresaAtiva, usuarioAtivo, item.ATD_ID);
    this.setState({ loading: false });


    if (res && res.length !== 0) {
      scheduleData.ORDERS.NEW = res[0].ITEMS;
      await updateScheduleData(scheduleData)
      this.props.history.push({
        pathname: '/EditOrder',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
          pos: index,
          id: res[0].ATD_ID,
          ATD_OBS: res[0].ATD_OBS,
          ATD_OPER_ID: res[0].ATD_OPER_ID
        },
      });
    } else {
      inProgress[index].ATD_FLAG_SITUACAO = 'B';
      scheduleData.ORDERS.INPROGRESS = inProgress;
      await updateScheduleData(scheduleData)
      this.setState({ inProgress });
      alerta('Não é possível editar esse pedido', 2);
      return;
    }
  };

  handleViewOrder = async (item) => {
    const { cliente, pesquisas } = this.state;
    const scheduleData = await getScheduleData()

    const inventory = scheduleData.CONFERENCE.INVENTORY;
    const result = [];

    item.ITEMS.forEach((element) => {
      const exist = inventory?.find((e) => e.ESIN_ID === element.PED_ESIN_ID);
      if (exist) {
        exist.ESIN_LOTE = exist.LOTE;
        exist.ESIN_SERIE = exist.SERIE;
        exist.PED_VALOR_UNIT = element.PED_VALOR_UNIT;
        exist.PED_VALOR = element.PED_VALOR;
        exist.PED_QTDE = element.PED_QTDE;
        result.push(exist);
      }
    });

    scheduleData.ORDERS.NEW = result;

    await updateScheduleData(scheduleData)
    this.props.history.push({
      pathname: '/EditOrder',
      state: {
        cliente: cliente,
        pesquisas: pesquisas,
        view: true,
        ATD_OBS: item.ATD_OBS,
      },
    });
  };

  render() {
    const { cliente, pesquisas, inProgress, loading } = this.state;

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
                cliente: cliente,
                pesquisas: pesquisas,
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
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Pedido de venda</p>
        </Titulo>
        <Container>
          <section style={{ width: '100%' }}>
            <div style={{ width: '98%', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
              <Button
                onClick={() => {
                  this.props.history.push({
                    pathname: '/CreateOrder',
                    state: {
                      cliente: cliente,
                      pesquisas: pesquisas,
                    },
                  });
                }}
                style={{ display: 'flex', gap: '0.2rem', margin: '0.2rem', width: '100%' }}
                className="waves-effect waves-light saib-button is-primary"
              >
                Criar novo pedido
                <Icon className="modal-close">add</Icon>
              </Button>
            </div>

            {inProgress && inProgress.length > 0 && (
              <p style={{ fontWeight: '700', fontSize: '1.4rem', padding: '0.2rem' }}>Pedidos</p>
            )}
            {inProgress &&
              inProgress.length > 0 &&
              inProgress.map((item, index) => (
                <div
                  className="card"
                  key={item.ATD_ID}
                  style={{
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: '1px solid #9545ba',
                    width: '98%',
                    marginLeft: '5px',
                    boxShadow:
                      'rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      background: '#8E44AD',
                      borderRadius: '5px 5px 0px 0px',
                      padding: '4px',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                      {item.ATD_QTDE_TOTAL} produto (s) - Valor total: {FormataValorMonetario(item.ATD_VALOR_TOTAL)}
                    </span>
                  </div>
                  <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>
                    Criado {formatOracleDateToBr(item.ATD_DATA)}
                  </p>
                  {item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'L' && (
                    <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>Pedido já processado</p>
                  )}
                  {(item.ATD_FLAG_SITUACAO === 'P' || !item.ATD_FLAG_SITUACAO) && (
                      <Button
                        onClick={() => this.handleEditOrder(item, index)}
                        style={{ display: 'flex', gap: '0.2rem', margin: '0.5rem' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        Editar
                        <Icon>create</Icon>
                      </Button>
                  )}
                  {item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'L' && (
                    <Button
                      onClick={() => this.handleViewOrder(item, index)}
                      style={{ display: 'flex', gap: '0.2rem', margin: '0.5rem' }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      Visualizar
                      <Icon>search</Icon>
                    </Button>
                  )}
                </div>
              ))}
          </section>
        </Container>
      </>
    );
  }
}

export default withRouter(Order);
