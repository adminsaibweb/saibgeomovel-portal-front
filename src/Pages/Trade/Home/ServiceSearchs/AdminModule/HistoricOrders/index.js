import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Button, Icon } from 'react-materialize';
import { handleDeleteSale, handleGetSales } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { getFromStorage } from '../../../../../../services/auth';
import { Titulo } from '../style';
import { alerta, FormataValorMonetario, formatOracleDateToBr, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';

class HistoricOrders extends Component {
  state = {
    status: 0,
    loading: false,
    searchProduct: '',
    products: [],
    productsOrder: [],
    typeOperation: 0,
    openDialogOptions: false,
    openViewOrders: false,
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, order } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let inProgress = scheduleData.ORDERS_DIRECT;
    if (inProgress) {
      inProgress = scheduleData.ORDERS_DIRECT.INPROGRESS;
    }

    if (order) {
      this.setState({
        productsOrder: order,
      });
    }

    this.setState({
      cliente,
      pesquisas,
      loading: false,
      openDialogOptions: order && order.length > 0 ? false : true,
      inProgress,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleEditOrder = async (ATD_ID, index) => {
    const { empresaAtiva, usuarioAtivo, cliente, pesquisas, inProgress } = this.state;
    const scheduleData = await getScheduleData()

    this.setState({ loading: true });
    const res = await handleGetSales(empresaAtiva, usuarioAtivo, ATD_ID);
    this.setState({ loading: false });

    if (res && res.length !== 0) {
      this.props.history.push({
        pathname: '/EditOrderDirect',
        state: {
          cliente,
          pesquisas,
          order: inProgress[index],
          pos: index,
        },
      });
    } else {
      inProgress[index].ATD_FLAG_SITUACAO = 'B';
      scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
      await updateScheduleData(scheduleData)
      this.setState({ inProgress });
      alerta('Não é possível editar esse pedido', 2);
      return;
    }
  };

  handleDeleteOrder = async (index) => {
    let { empresaAtiva, usuarioAtivo, inProgress } = this.state;

    this.setState({ loading: true });
    const responses = await Promise.all(
      inProgress[index].ITEMS.map(async (item) => {
        if (item.PED_NR_PEDIDO) {
          return await handleDeleteSale(empresaAtiva, usuarioAtivo, item.PED_NR_PEDIDO);
        } else {
          return true;
        }
      })
    );

    const verify = responses.every((e) => e);

    if (verify) {
      const res = await handleDeleteSale(empresaAtiva, usuarioAtivo, inProgress[index].ATD_ID);

      if (res) {
        delete inProgress[index];
        inProgress = inProgress.filter((ele) => ele);

        this.setState({ inProgress });
        const scheduleData = await getScheduleData()
        scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
        await updateScheduleData(scheduleData)
      }
    }
    this.setState({ loading: false });
  };

  render() {
    const { cliente, pesquisas, loading, inProgress } = this.state;

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
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Histórico de pedidos</p>
        </Titulo>
        <section style={{ width: '100%', padding: '10px 5px' }}>
          {(!inProgress || (inProgress && inProgress.length === 0)) && (
            <p style={{ fontWeight: '700', fontSize: '1.4rem', padding: '0.2rem' }}>Não existem registro de pedidos</p>
          )}
          {inProgress && inProgress.length > 0 && (
            <p style={{ fontWeight: '700', fontSize: '1.4rem', padding: '0.2rem' }}>Pedidos</p>
          )}
          {inProgress &&
            inProgress.length > 0 &&
            inProgress.map((item, index) => (
              <div
                style={{
                  borderTop: index !== 0 && '2px solid #b3b3b3',
                  paddingTop: index !== 0 && '1rem',
                }}
              >
                <div
                  className="card"
                  key={item.ATD_ID}
                  style={{
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: '1px solid',
                    borderColor: item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'L' ? '#14532d' : '#006ffd',
                    width: '98%',
                    marginLeft: '5px',
                    marginTop: '-2px',
                    boxShadow:
                      'rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      background: item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'L' ? '#14532d' : '#006ffd',
                      borderRadius: '5px 5px 0px 0px',
                      padding: '4px',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                      {item.ATD_QTDE_TOTAL} {item.ATD_QTDE_TOTAL === 1 ? 'produto' : 'produtos'} - Valor total:{' '}
                      {FormataValorMonetario(item.ATD_VALOR_TOTAL)}
                    </span>
                  </div>
                  {item.ITEMS.find((e) => e.CLI_ID === -1) && (
                    <>
                      <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1.1rem' }}>
                        {item.ITEMS.find((e) => e.CLI_ID === -1)?.NOME_FANTASIA} -{' '}
                        {item.ITEMS.find((e) => e.CLI_ID === -1)?.RAZAO_SOCIAL}
                      </p>
                      <p style={{ padding: '0 0.2rem', fontWeight: '500', fontSize: '1rem' }}>
                        {item.ITEMS.find((e) => e.CLI_ID === -1)?.CIDADE} -{' '}
                        {item.ITEMS.find((e) => e.CLI_ID === -1)?.UF}
                      </p>
                    </>
                  )}

                  <p style={{ padding: '0 0.2rem', fontWeight: '600', fontSize: '1rem', textDecoration: 'underline' }}>
                    Venda
                  </p>
                  <p style={{ padding: '0 0.2rem', fontWeight: '500', fontSize: '1rem' }}>
                    Criado {formatOracleDateToBr(item.ATD_DATA)}
                  </p>
                  {item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'L' && (
                    <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem', color: '#14532d' }}>
                      Pedido já processado
                    </p>
                  )}
                  {item.ATD_FLAG_SITUACAO && item.ATD_FLAG_SITUACAO === 'P' && (
                    <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>
                      ID do atendimento: {item.ATD_ID}
                    </p>
                  )}
                  {(item.ATD_FLAG_SITUACAO === 'P' || !item.ATD_FLAG_SITUACAO) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '5px',
                        width: '100%',
                        gap: '0.2rem',
                        padding: '0.2rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <Button
                        onClick={() => this.handleEditOrder(item.ATD_ID, index)}
                        style={{ display: 'flex', gap: '0.2rem' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <Icon>create</Icon>
                        Editar
                      </Button>
                      <Button
                        onClick={() => this.handleDeleteOrder(index)}
                        style={{ display: 'flex', gap: '0.2rem' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <Icon>delete</Icon>
                        Excluir
                      </Button>
                    </div>
                  )}

                  {item.ITEMS.map((element) => (
                    <div
                      className="card"
                      key={element.PED_NR_PEDIDO}
                      style={{
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #8e44ad',
                        width: '98%',
                        marginLeft: '5px',
                        boxShadow:
                          'rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: '#8e44ad',
                          borderRadius: '5px 5px 0px 0px',
                          padding: '4px',
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                          {element.QTDE_PEDIDO || element.PED_QTDE}{' '}
                          {element.QTDE_PEDIDO === 1 || element.PED_QTDE === 1 ? 'produto' : 'produtos'} - Valor total:{' '}
                          {FormataValorMonetario(element.PED_VALOR)}
                        </span>
                      </div>
                      <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1.1rem' }}>
                        {element?.PROD_DESCR}
                      </p>
                      <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1.1rem' }}>
                        {element?.NOME_FANTASIA} - {element?.RAZAO_SOCIAL}
                      </p>
                      <p style={{ padding: '0 0.2rem', fontWeight: '500', fontSize: '1rem' }}>
                        {element?.CIDADE} - {element?.UF}
                      </p>
                      <p
                        style={{
                          padding: '0 0.2rem',
                          fontWeight: '600',
                          fontSize: '1rem',
                          textDecoration: 'underline',
                        }}
                      >
                        Consignado
                      </p>
                      {element.ATD_FLAG_SITUACAO && element.ATD_FLAG_SITUACAO === 'L' && (
                        <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem', color: '#14532d' }}>
                          ID do atendimento: {element.ATD_ID}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      </>
    );
  }
}

export default withRouter(HistoricOrders);
