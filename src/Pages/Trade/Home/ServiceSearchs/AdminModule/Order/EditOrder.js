import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Container, TextAreaDiv } from './style';
import { Button, Icon } from 'react-materialize';
import { handleEditSale } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { alerta, formatFloatBr, formataMoedaPFloat, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';

class EditOrder extends Component {
  state = {
    status: 0,
    loading: false,
    requests: [],
    valueOrder: 0,
    posInput: false,
    ATD_OBS: ''
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, pos, id, ATD_OBS, view, ATD_OPER_ID } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    const scheduleData = await getScheduleData()

    let orders = scheduleData.ORDERS;
    if (orders) {
      orders = scheduleData.ORDERS.NEW;
    }

    this.setState({
      cliente,
      pesquisas,
      requests: orders,
      scheduleData,
      pos,
      id,
      ATD_OBS: ATD_OBS || '',
      view,
      ATD_OPER_ID
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleFinished = async () => {
    let { cliente, pesquisas, requests, pos, id, ATD_OBS, ATD_OPER_ID } = this.state;
    const scheduleData = await getScheduleData()

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

    if (!scheduleData.GPA_GEN_ID_TAB_PRECO) {
      alerta('Não existe uma tabela de preços definida', 2);
      this.setState({ loading: false });
      return;
    }

    const ITEMS = requests.map((item) => {
      return {
        PED_ID: item.PED_ID,
        PED_OPER_ID: scheduleData.OPER_ID,
        PED_PROD_ID: item.PED_PROD_ID,
        PED_QTDE: item.PED_QTDE,
        PED_VALOR_UNIT: formataMoedaPFloat(item.PED_VALOR_UNIT),
        PED_VALOR: formataMoedaPFloat(item.PED_VALOR_UNIT) * item.PED_QTDE,
        PED_ESIN_ID: item.ESIN_ID,
        PED_GEN_ID_TAB_PRECO: scheduleData.GPA_GEN_ID_TAB_PRECO,
      };
    });

    const ATD_VALOR_TOTAL = ITEMS.reduce(
      (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
      0
    );

    const ATD_QTDE_TOTAL = ITEMS.reduce(
      (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
      0
    )

    const sessao = getFromStorage();
    const res = await handleEditSale(
      null,
      ATD_OPER_ID,
      id,
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
      scheduleData.ORDERS.INPROGRESS[pos] = res[0];
      await updateScheduleData(scheduleData)
      scheduleData.ORDERS.NEW = [];
      await updateScheduleData(scheduleData)
      this.props.history.push({
        pathname: '/Order',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
    }
  };

  handleRemoveProduct = (prod) => {
    let { requests } = this.state

    requests = requests.filter(e => e.PED_ID !== prod.PED_ID)

    this.setState({ requests });
  }

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
              pathname: '/Order',
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
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>
            {!view && "Editar pedido"}
            {view && "Visualizar pedido"}
          </p>
          {!view && requests && requests.length > 0 && (
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
          <div style={{ height: '100%', width: '100%', padding: '0 0.2rem' }}>
            {requests.map((prod, index) => (
              <div key={prod.PED_ID}>
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
                    <p style={{ fontWeight: '700' }}>{prod.PROD_DESCR}</p>
                  </div>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Lote: </strong> {prod.ESIN_LOTE}
                  </p>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Série: </strong> {prod.ESIN_SERIE}
                  </p>
                  <p style={{ padding: '0 0.2rem' }}>
                    <strong>Qtde: </strong> {prod.PED_QTDE}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.2rem', marginBottom: '0.5rem' }}>
                    <p>
                      <strong>Valor unitário: </strong> {formatFloatBr(formataMoedaPFloat(prod.PED_VALOR_UNIT))}
                    </p>
                    {!view && <Button
                      onClick={() => {
                        this.setState({
                          valueOrder: formatFloatBr(formataMoedaPFloat(prod.PED_VALOR_UNIT)) || 0,
                          posInput: index,
                        });
                      }}
                      style={{ marginLeft: '0.5rem' }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      <RiPencilFill size={16} />
                    </Button>}
                  </div>
                  {!view && typeof posInput === 'number' && posInput === index && (
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
                            const { scheduleData } = this.state;
                          requests[index].PED_VALOR_UNIT = valueOrder;
                          requests[index].PED_VALOR = formataMoedaPFloat(valueOrder) * prod.PED_QTDE;
                          scheduleData.ORDERS.NEW = requests;
                          await updateScheduleData(scheduleData)
                          this.setState({ requests, valueOrder: false, posInput: false });
                          }
                        }}
                      />
                      <Button
                        onClick={async () => {
                          const { scheduleData } = this.state;
                          requests[index].PED_VALOR_UNIT = valueOrder;
                          requests[index].PED_VALOR = formataMoedaPFloat(valueOrder) * prod.PED_QTDE;
                          scheduleData.ORDERS.NEW = requests;
                          await updateScheduleData(scheduleData)
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
                  <Button
                    onClick={() => this.handleRemoveProduct(prod)}
                    style={{ display: 'flex', gap: '0.2rem', margin: '0.5rem' }}
                    className="waves-effect waves-light saib-button is-primary"
                  >
                    <Icon>delete</Icon>
                    Remover produto
                  </Button>
                </div>
              </div>
            ))}

            <TextAreaDiv>
              <label style={{ fontWeight: '700', fontSize: '1rem', color: '#000' }}>Observação do pedido</label>
              <textarea disabled={view} value={ATD_OBS} onChange={(event) => this.setState({ ATD_OBS: event.target.value })} maxLength={300} cols={4} />
            </TextAreaDiv>
          </div>
        </Container>
      </>
    );
  }
}

export default withRouter(EditOrder);
