import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Container, TextAreaDiv } from '../Order/style';
import { Button, Icon } from 'react-materialize';
import { handleDeleteSale, handleEditSale } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import Question from '../../../../../../Components/Globals/Question';
import { Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { alerta, formatFloatBr, formataMoedaPFloat, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';
import api from '../../../../../../services/api';

class EditOrderDirect extends Component {
  state = {
    status: 0,
    loading: false,
    requests: [],
    valueOrder: 0,
    posInput: false,
    ATD_OBS: '',
    idsExclude: [],
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, order, pos } = this.props.history.location.state;
    await this.carregarVariaveisEstado();

    const scheduleData = await getScheduleData()
    let inProgress = scheduleData.ORDERS_DIRECT;
    if (inProgress) {
      inProgress = scheduleData.ORDERS_DIRECT.INPROGRESS;
    }

    this.setState({
      cliente,
      pesquisas,
      requests: order.ITEMS,
      ATD_OBS: order.ATD_OBS,
      pos,
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

  handleRemoveProduct = async (prod) => {
    let { requests, idsExclude } = this.state;

    requests = requests.filter((e) => e.PED_NR_PEDIDO !== prod.PED_NR_PEDIDO);

    const exist = requests.find((e) => e.PED_NR_PEDIDO === prod.PED_NR_PEDIDO);
    if (!exist && prod.PED_NR_PEDIDO !== -1) {
      idsExclude.push(prod.PED_NR_PEDIDO);
    }

    this.setState({ requests, idsExclude });
  };

  handleFinished = async () => {
    let { cliente, pesquisas, requests, pos, ATD_OBS, idsExclude, inProgress, empresaAtiva, usuarioAtivo } = this.state;

    let { order } = this.props.history.location.state;
    const scheduleData = await getScheduleData()

    await Promise.all(
      idsExclude.map(async (item) => {
        return await this.handleDeleteProductOrder(item);
      })
    );

    if (order && order.ITEMS.length === 0) {
      await handleDeleteSale(empresaAtiva, usuarioAtivo, order.ATD_ID);
      this.setState({ loading: false, requests: [] });
      this.props.history.push({
        pathname: '/HistoricOrders',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
      return;
    }

    scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
    await updateScheduleData(scheduleData)
    this.setState({ loading: true });

    const allValue = requests.every((e) => formataMoedaPFloat(e.PED_VALOR_UNIT));

    if (!allValue) {
      alerta('Informe os valores', 2);
      this.setState({ loading: false });
      return;
    }

    if (!scheduleData.ESTR_ID) {
      alerta('Esse promotor não possui estrutura comercial', 2);
      return;
    }

    requests = await this.handleUpdateDevolutions(requests);

    const ITEMS = requests.map((item) => {
      return {
        PED_OPER_ID: item.PED_OPER_ID || order.ATD_OPER_ID,
        PED_PROD_ID: item.PROD_ID_VENDA || item.PED_PROD_ID || item.PROD_ID,
        PED_QTDE: item.PED_QTDE,
        PED_VALOR_UNIT: formataMoedaPFloat(item.PED_VALOR_UNIT),
        PED_VALOR: formataMoedaPFloat(item.PED_VALOR_UNIT) * item.PED_QTDE,
        PED_ESIN_EMP_ID: item.PED_ESIN_EMP_ID_VENDA || item.PED_ESIN_EMP_ID || order.ATD_EMP_ID,
        PED_ESIN_ID: item.ESIN_ID_VENDA || item.PED_ESIN_ID,
        PED_NR_PEDIDO: item.PED_NR_PEDIDO || item.PED_ID,
        ...item
      };
    });

    const ATD_VALOR_TOTAL = ITEMS.reduce(
      (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
      0
    );

    const ATD_QTDE_TOTAL = ITEMS.reduce(
      (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
      0
    );

    const sessao = getFromStorage();
    const res = await handleEditSale(
      order.ATD_TIPO_FRETE,
      order.ATD_OPER_ID,
      order.ATD_ID,
      sessao.empresaId,
      sessao.codigoUsuario,
      scheduleData.cliAtendimento,
      scheduleData.ESTR_ID,
      ATD_VALOR_TOTAL,
      ATD_OBS,
      ATD_QTDE_TOTAL,
      ITEMS,
      []
    );

    this.setState({ loading: false });
    if (res && res.length > 0) {
      inProgress[pos] = res[0];
      scheduleData.ORDERS_DIRECT.INPROGRESS = inProgress;
      await updateScheduleData(scheduleData)

      this.props.history.push({
        pathname: '/HistoricOrders',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
    }
  };

  handleUpdateDevolutions = async (products) => {
    try {
      let { empresaAtiva, usuarioAtivo, requests } = this.state;
      const scheduleData = await getScheduleData()

      await Promise.all(
        products.map(async (ele, index) => {
          if (scheduleData.OPER_ID_CONSIGNACAO_DEV === ele.PED_OPER_ID && ele.UPDATE) {
            const params = {
              ped_id: ele.PED_NR_PEDIDO,
            };

            const res = await api.get(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, {
              params,
            });

            const { sucess, data } = res.data;

            if (sucess && data && data.length > 0) {
              const payload = data[0];
              const pos = payload.ITEMS.findIndex((e) => e.PED_NR_PEDIDO === ele.PED_NR_PEDIDO);

              if (pos !== -1) {
                payload.ITEMS[pos].PED_VALOR = ele.PED_VALOR;
                payload.ITEMS[pos].PED_VALOR_UNIT = formataMoedaPFloat(ele.PED_VALOR_UNIT);
                payload.ITEMS[pos].PED_NR_PEDIDO = ele.PED_NR_PEDIDO;
                payload.ITEMS[pos].PED_OPER_ID = ele.PED_OPER_ID;
              }

              const ATD_VALOR_TOTAL = payload.ITEMS.reduce(
                (accumulator, currentValue) =>
                  formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
                0
              );

              const ATD_QTDE_TOTAL = payload.ITEMS.reduce(
                (accumulator, currentValue) =>
                  formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
                0
              );

              const update = await handleEditSale(
                data[0].ATD_TIPO_FRETE,
                data[0].ATD_OPER_ID,
                data[0].ATD_ID,
                data[0].ATD_EMP_ID,
                usuarioAtivo,
                data[0].ATD_CLI_ID,
                data[0].ATD_ESTR_ID,
                ATD_VALOR_TOTAL,
                data[0].ATD_OBS,
                ATD_QTDE_TOTAL,
                data[0].ITEMS,
                data[0].PAGAMENTOS
              );

              if (update && update.length > 0) {
                update[0].ITEMS = update[0].ITEMS.map((element) => {
                  if (element?.PED_NR_PEDIDO === ele.PED_NR_PEDIDO) {
                    element.PED_ESIN_ID = ele.PED_ESIN_ID;
                    element.PED_ESIN_EMP_ID = ele.PED_ESIN_EMP_ID_VENDA || ele.PED_ESIN_EMP_ID || requests[index].ATD_EMP_ID
                    element.PED_PROD_ID = ele.PED_PROD_ID;
                    element.PED_OPER_ID = ele.PED_OPER_ID;
                  }
                  delete element.PED_ID
                  element.PED_NR_PEDIDO = element.PED_ID;
                  return element;
                });

                requests = requests.filter((e) => e.PED_NR_PEDIDO !== ele.PED_NR_PEDIDO);
                requests = [...requests, ...update[0].ITEMS];

                this.setState({ requests });
              }
            }
          }
        })
      );

      return requests
    } catch (error) {
      console.log(error);
    }
  };

  handleDeleteProductOrder = async (id) => {
    try {
      let { empresaAtiva, usuarioAtivo, requests } = this.state;
      const params = {
        ped_id: id,
      };

      const res = await api.get(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, {
        params,
      });

      const { sucess, data } = res.data;

      if (sucess && data && data.length > 0) {
        const qtd = data[0].ITEMS.some((e) => e.PED_NR_PEDIDO !== id);

        if (!qtd) {
          await handleDeleteSale(empresaAtiva, usuarioAtivo, data[0].ATD_ID, false);
        } else {
          data[0].ITEMS = data[0].ITEMS.filter((e) => e.PED_NR_PEDIDO !== id);

          const ATD_VALOR_TOTAL = data[0].ITEMS.reduce(
            (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
            0
          );

          const ATD_QTDE_TOTAL = data[0].ITEMS.reduce(
            (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
            0
          );

          const update = await handleEditSale(
            data[0].ATD_TIPO_FRETE,
            data[0].ATD_OPER_ID,
            data[0].ATD_ID,
            data[0].ATD_EMP_ID,
            usuarioAtivo,
            data[0].ATD_CLI_ID,
            data[0].ATD_ESTR_ID,
            ATD_VALOR_TOTAL,
            data[0].ATD_OBS,
            ATD_QTDE_TOTAL,
            data[0].ITEMS,
            data[0].PAGAMENTOS
          );

          if (update) {
            const newRequests = requests.filter((e) => !data[0].ITEMS.find((ele) => e.PED_NR_PEDIDO === ele.PED_ID));

            update.ITEMS = update.ITEMS.map((element) => {
              element.PED_NR_PEDIDO = element.PED_ID;
              return element;
            });

            requests = [...(newRequests || []), ...update.ITEMS];
            this.setState({ requests });
          }
        }
      }
    } catch (error) {
      //
    }
  };

  render() {
    const { cliente, pesquisas, loading, requests, valueOrder, posInput, ATD_OBS, view } = this.state;

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
              pathname: '/HistoricOrders',
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
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Editar pedido</p>
          <button
              onClick={this.handleFinished}
              className="saib-button is-primary"
              style={{
                display: 'flex',
                flexDirection: 'row',
                color: '#8E44AD',
                background: '#fff',
                borderRadius: '4px',
                fontSize: '16px',
                marginRight: '5px',
                gap: '0.2rem',
              }}
            >
              Salvar
              <IoIosCheckmarkCircle size={18} />
            </button>
        </Titulo>
        <Container>
          <div style={{ height: '100%', width: '100%', padding: '0 0.2rem' }}>
            {requests.map((prod, index) => (
              <div key={prod.PED_NR_PEDIDO}>
                <div className="card" style={{ fontSize: '16px', borderRadius: '5px', border: '1px solid #8e44ad' }}>
                  <div
                    style={{
                      padding: '4px 6px',
                      background: '#8e44ad',
                      borderRadius: '5px 5px 0px 0px',
                      color: '#fff',
                      width: '100%',
                    }}
                  >
                    <p style={{ fontWeight: '700' }}>{prod.PRODUTO || prod.PROD_DESCR}</p>
                  </div>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Lote: </strong> {prod.LOTE || prod.ESIN_LOTE}
                  </p>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Série: </strong> {prod.SERIE || prod.ESIN_SERIE}
                  </p>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Qtde: </strong> {prod.PED_QTDE}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.2rem', marginBottom: '0.5rem' }}>
                    <p>
                      <strong>Valor unitário: </strong> {formatFloatBr(formataMoedaPFloat(prod.PED_VALOR_UNIT))}
                    </p>
                    {!view && (
                      <Button
                        onClick={() => {
                          this.setState({
                            valueOrder: formatFloatBr(formataMoedaPFloat(prod.PED_VALOR_UNIT)) || 0,
                            posInput: index,
                          });
                          setTimeout(() => {
                            const doc = document.getElementById(`valor${index}`);
                            if (doc) {
                              document.getElementById(`valor${index}`).focus();
                            }
                          }, 200);
                        }}
                        style={{ marginLeft: '0.5rem' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <RiPencilFill size={16} />
                      </Button>
                    )}
                  </div>
                  {typeof posInput === 'number' && posInput === index && (
                    <div style={{ padding: '0 0.2rem' }}>
                      <strong style={{ color: '#000', fontSize: '1.2rem', fontWeight: '600' }}>
                        Informe o valor unitário
                      </strong>

                      <input
                        id={`valor${index}`}
                        name={`valor${index}`}
                        value={valueOrder}
                        onChange={(event) => {
                          const valor = event.target.value;
                          let v = String(valor).replace(/\D/g, '');

                          v = (Number(v) / 100).toFixed(2).toString();

                          v = v.replace('.', ',');

                          v = v.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');

                          v = v.replace(/(\d)(\d{3}),/g, '$1.$2,');
                          this.setState({ valueOrder: `R$ ${v}` });
                          event.target.value = `R$ ${v}`;
                        }}
                        onKeyUp={async (event) => {
                          if (event.key === 'Enter') {
                            requests[index].UPDATE = true;
                            requests[index].PED_VALOR_UNIT = valueOrder;
                            requests[index].PED_VALOR = formataMoedaPFloat(valueOrder) * prod.PED_QTDE;
                            this.setState({ requests, valueOrder: false, posInput: false });
                          }
                        }}
                      />
                      <Button
                        onClick={async () => {
                          requests[index].UPDATE = true;
                          requests[index].PED_VALOR_UNIT = valueOrder;
                          requests[index].PED_VALOR = formataMoedaPFloat(valueOrder) * prod.PED_QTDE;
                          this.setState({ requests, valueOrder: false, posInput: false });
                        }}
                        style={{ gap: '0.3rem', marginBottom: '0.5rem', marginTop: '0.5rem', width: '100%' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <Icon className="modal-close">check_circle</Icon>
                        Confirmar
                      </Button>
                    </div>
                  )}
                  {prod.PED_VALOR && (
                    <p style={{ padding: '0 0.2rem' }}>
                      <strong>Valor total: </strong> {formatFloatBr(prod.PED_VALOR)}
                    </p>
                  )}
                  <div style={{ margin: '0.3rem' }}>
                    <Question
                      iconeBotaoPadrao={<Icon>delete</Icon>}
                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                      textoBotaoPadrao="Remover produto"
                      titulo={'Remover produto'}
                      tituloBotaoSim="Confirmar"
                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      tituloBotaoNao="Cancelar"
                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      message={
                        <div className="divModal">
                          <p style={{ fontWeight: '700', textAlign: 'center' }} className="spanModal">
                            Ao remover o produto, será excluído o pedido de consignado dele
                          </p>
                        </div>
                      }
                      onNo={() => {}}
                      onYes={() => {
                        this.handleRemoveProduct(prod);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {requests && requests.length > 0 && (
              <TextAreaDiv>
                <label style={{ fontWeight: '700', fontSize: '1rem', color: '#000' }}>Observação do pedido</label>
                <textarea
                  disabled={view}
                  value={ATD_OBS}
                  onChange={(event) => this.setState({ ATD_OBS: event.target.value })}
                  maxLength={300}
                  cols={4}
                />
              </TextAreaDiv>
            )}
          </div>
        </Container>
      </>
    );
  }
}

export default withRouter(EditOrderDirect);
