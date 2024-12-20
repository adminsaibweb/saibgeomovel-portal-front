import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Container, TextAreaDiv } from './style';
import { Button, Icon } from 'react-materialize';
import { handleAddSale } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { alerta, formatFloatBr, formataMoedaPFloat, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';

class NewOrder extends Component {
  state = {
    status: 0,
    loading: false,
    requests: [],
    typeScreen: 0,
    valueOrder: 0,
    posInput: false,
    ATD_OBS: '',
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, pageNew, order } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let orders = scheduleData.ORDERS;
    if (orders) {
      orders = scheduleData.ORDERS.NEW;
    }

    if (order) {
      orders = order;
    }

    this.setState({
      cliente,
      pesquisas,
      pageNew,
      requests: orders,
      scheduleData,
      order,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleEditValue = async (index, prod) => {
    const { scheduleData, requests, valueOrder } = this.state;
    requests[index].VALOR = valueOrder;
    requests[index].PED_VALOR = formataMoedaPFloat(valueOrder) * (prod.QTDE_ORDER || prod.QTDE_PEDIDO);
    scheduleData.ORDERS.NEW = requests;
    await updateScheduleData(scheduleData)
    this.setState({ requests, valueOrder: false, posInput: false });
  };

  handleFinished = async () => {
    let { cliente, pesquisas, requests, pageNew, order, ATD_OBS } = this.state;
    const { posOrder } = this.props.history.location.state;
    const scheduleData = await getScheduleData()

    this.setState({ loading: true });

    const allValue = requests.every((e) => formataMoedaPFloat(e.PED_VALOR));

    if (!allValue) {
      alerta('Informe os valores', 2);
      this.setState({ loading: false });
      return;
    }

    if (!scheduleData.ESTR_ID) {
      alerta('Esse promotor não possui estrutura comercial', 2);
      this.setState({ loading: false });
      return;
    }

    if (!scheduleData.GPA_GEN_ID_TAB_PRECO) {
      alerta('Não existe uma tabela de preços definida', 2);
      this.setState({ loading: false });
      return;
    }

    const sessao = getFromStorage();
    const OPER_ID = scheduleData.OPER_ID_CONSIGNACAO;

    if (!scheduleData.OPER_ID_CONSIGNACAO_DEV) {
      alerta('Não existe operação de devolução', 2);
      this.setState({ loading: false });
      return;
    }

    if (!scheduleData.GPA_GEN_ID_TAB_PRECO_DEV) {
      alerta('Não existe uma tabela de preços definida', 2);
      this.setState({ loading: false });
      return;
    }

    const ITEMS_DEV = requests.map((item) => {
      return {
        PED_OPER_ID: scheduleData.OPER_ID_CONSIGNACAO_DEV,
        PED_PROD_ID: item.PROD_ID,
        PED_QTDE: item.QTDE_ORDER || item.QTDE_PEDIDO,
        PED_VALOR_UNIT: formataMoedaPFloat(item.VALOR),
        PED_VALOR: formataMoedaPFloat(item.VALOR) * (item.QTDE_ORDER || item.QTDE_PEDIDO),
        PED_ESIN_ID: item.ESIN_ID || item.PROD_ID,
        PED_GEN_ID_TAB_PRECO: scheduleData.GPA_GEN_ID_TAB_PRECO_DEV,
      };
    });

    const ATD_VALOR_TOTAL = ITEMS_DEV.reduce(
      (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
      0
    );

    const res_dev = await handleAddSale(
      null,
      scheduleData.OPER_ID_CONSIGNACAO_DEV,
      sessao.empresaId,
      sessao.codigoUsuario,
      scheduleData.cliAtendimento,
      scheduleData.ESTR_ID,
      ATD_VALOR_TOTAL,
      ATD_OBS,
      ITEMS_DEV.length,
      ITEMS_DEV,
      []
    );

    if (res_dev && res_dev.length > 0) {
      res_dev[0].ITEMS = res_dev[0].ITEMS.map((element) => {
        element.PED_OBS = res_dev[0].ATD_ID;
        return element;
      });

      const ITEMS = requests.map((item) => {
        item.PED_ESIN_ID = item.ESIN_ID || item.PROD_ID

        res_dev.forEach((ele) => {
          const itemRes = ele?.ITEMS?.find((e) => e.PED_PROD_ID === item.PROD_ID && e.PED_ESIN_ID === item.PED_ESIN_ID);

          if (itemRes) {
            console.log("hereee")
            item.PED_NR_PEDIDO = itemRes.PED_ID;
            item.PED_OBS = itemRes.PED_OBS;
          }
        });

        return {
          PED_OPER_ID: scheduleData.OPER_ID_CONSIGNACAO,
          PED_PROD_ID: item.PROD_ID,
          PED_QTDE: item.QTDE_ORDER || item.QTDE_PEDIDO,
          PED_VALOR_UNIT: formataMoedaPFloat(item.VALOR),
          PED_VALOR: formataMoedaPFloat(item.VALOR) * (item.QTDE_ORDER || item.QTDE_PEDIDO),
          PED_ESIN_ID: item.PED_ESIN_ID,
          PED_GEN_ID_TAB_PRECO: scheduleData.GPA_GEN_ID_TAB_PRECO,
          PED_NR_PEDIDO: item.PED_NR_PEDIDO,
          PED_OBS: item.PED_OBS,
        };
      });

      const ATD_VALOR_TOTAL = ITEMS.reduce(
        (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
        0
      );

      const res = await handleAddSale(
        null,
        OPER_ID,
        sessao.empresaId,
        sessao.codigoUsuario,
        scheduleData.cliAtendimento,
        scheduleData.ESTR_ID,
        ATD_VALOR_TOTAL,
        ATD_OBS,
        ITEMS.length,
        ITEMS,
        []
      );

      this.setState({ loading: false });

      if (res && res.length > 0) {
        alerta('Pedido feito com sucesso!', 1);
        scheduleData.ORDERS.INPROGRESS = [...(scheduleData.ORDERS.INPROGRESS || []), res[0]];

        if (!pageNew) {
          requests = requests.map((item) => {
            item.STATUS = 2;
            return item;
          });

          scheduleData.CONFERENCE.PRODUCTS[posOrder] = requests[0];
          scheduleData.ORDERS.NEW = [];
          await updateScheduleData(scheduleData)
          this.props.history.push({
            pathname: '/Conference',
            state: {
              cliente: cliente,
              pesquisas: pesquisas,
            },
          });
        } else {
          scheduleData.ORDERS.NEW = [];
          await updateScheduleData(scheduleData)
          this.props.history.push({
            pathname: '/Order',
            state: {
              cliente: cliente,
              pesquisas: pesquisas,
              order,
            },
          });
        }
      } else {
        alerta('Não foi possível criar o pedido', 2);
      }
    }
  };

  render() {
    const { cliente, pesquisas, loading, requests, typeScreen, valueOrder, posInput, pageNew, order, ATD_OBS } =
      this.state;

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
              pathname: pageNew ? '/CreateOrder' : '/Conference',
              state: {
                cliente: cliente,
                pesquisas: pesquisas,
                order,
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
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Novo pedido</p>
          {requests && requests.length > 0 && typeScreen === 0 && (
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
              Enviar
              <IoIosCheckmarkCircle size={18} />
            </button>
          )}
        </Titulo>
        <Container>
          {typeScreen === 0 && (
            <div style={{ height: '100%', width: '100%', padding: '0 0.2rem' }}>
              {requests.map((prod, index) => (
                <div key={`${prod.ESIN_ID}_${prod.PROD_ID}`}>
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
                      <p style={{ fontWeight: '700' }}>
                        {prod.CODIGO_INTEGRACAOO || prod.CODIGO || prod.PROD_CODIGO} - {prod.PRODUTO || prod.PROD_DESCR}
                      </p>
                    </div>
                    <p style={{ padding: '0 0.2rem' }}>
                      <strong>Lote: </strong> {prod.LOTE}
                    </p>
                    <p style={{ padding: '0 0.2rem' }}>
                      <strong>Série: </strong> {prod.SERIE}
                    </p>
                    <p style={{ padding: '0 0.2rem' }}>
                      <strong>Qtde: </strong> {prod.QTDE_ORDER}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.2rem', marginBottom: '0.5rem' }}>
                      <p>
                        <strong>Valor unitário: </strong> {formatFloatBr(formataMoedaPFloat(prod.VALOR))}
                      </p>
                      <Button
                        onClick={() => {
                          this.setState({
                            valueOrder: formatFloatBr(formataMoedaPFloat(prod.VALOR)) || 0,
                            posInput: index,
                          });
                        }}
                        style={{ marginLeft: '0.5rem' }}
                        className="waves-effect waves-light saib-button is-primary"
                      >
                        <RiPencilFill size={16} />
                      </Button>
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
                              await this.handleEditValue(index, prod);
                            }
                          }}
                        />
                        <Button
                          onClick={async () => {
                            await this.handleEditValue(index, prod);
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
                  </div>
                </div>
              ))}

              <TextAreaDiv>
                <label style={{ fontWeight: '700', fontSize: '1rem', color: '#000' }}>Observação do pedido</label>
                <textarea
                  value={ATD_OBS}
                  onChange={(event) => this.setState({ ATD_OBS: event.target.value })}
                  maxLength={300}
                  cols={4}
                />
              </TextAreaDiv>
            </div>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter(NewOrder);
