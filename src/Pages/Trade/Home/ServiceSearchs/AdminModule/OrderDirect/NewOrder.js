import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, TextAreaDiv } from '../Order/style';
import { Button, Icon } from 'react-materialize';
import { handleAddSale } from '../../../tradeGlobalFunctions';
import WaitScreen from '../../../../../../Components/Globals/WaitScreen';
import { Titulo } from '../../../style';
import { getFromStorage } from '../../../../../../services/auth';
import { alerta, formatFloatBr, formataMoedaPFloat, getScheduleData, updateScheduleData } from '../../../../../../services/funcoes';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';

class NewOrderDirect extends Component {
  state = {
    status: 0,
    loading: false,
    requests: [],
    valueOrder: 0,
    posInput: false,
  };

  componentDidMount = async () => {
    const { cliente, pesquisas, companys, order, view, productsFilter, productsOrigins } =
      this.props.history.location.state;
    await this.carregarVariaveisEstado();

    this.setState({
      cliente,
      pesquisas,
      requests: companys,
      order,
      view,
      productsFilter,
      productsOrigins,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleEditValue = async (indexCompany, index, prod) => {
    const { requests, valueOrder } = this.state;
    requests[indexCompany].products[index].VALOR = valueOrder;
    requests[indexCompany].products[index].PED_VALOR = formataMoedaPFloat(valueOrder) * prod.QTDE_PEDIDO;

    this.setState({ requests, valueOrder: false, posInput: false });
  };

  handleSendOrder = async () => {
    let { requests, cliente, pesquisas } = this.state;
    const { statusVenda } = this.props.history.location.state;
    const scheduleData = await getScheduleData()

    this.setState({ loading: true });
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

    let operationId = scheduleData.OPER_ID_CONSIGNACAO;
    if (statusVenda === 1) {
      operationId = scheduleData.OPER_ID;
    } else if (statusVenda === 2) {
      operationId = scheduleData.OPER_ID_BONIFICACAO;
    }

    if (!operationId) {
      alerta('Não existe operação para o tipo de venda selecionado', 2);
      this.setState({ loading: false });
      return;
    }

    if (!scheduleData.OPER_ID_CONSIGNACAO_DEV) {
      alerta('Não existe operação de devolução', 2);
      this.setState({ loading: false });
      return;
    }

    let count = scheduleData.ORDERS.ATD_COD_ATENDIMENTO || 0;

    const observations = await Promise.all(
      requests.map(async (item) => {
        const Nfs = item.products.map((item) => {
          return item.ESIN_NOTA_FISCAL;
        });
        const obs = `NF: ${Nfs}, ${item.OBSERVATION || ''}`;

        return obs;
      })
    );

    let allProducts = [];

    requests.forEach((item, index) => {
      const orders = item.products.map((element) => {
        element.OBSERVATION = item.OBSERVATION;
        element.SEQUENCIA = index;
        return element;
      });
      allProducts = [...allProducts, ...orders];
    });

    const allValue = allProducts.every((e) => formataMoedaPFloat(e.PED_VALOR));

    if (!allValue) {
      alerta('Informe os valores', 2);
      this.setState({ loading: false });
      return;
    }
    const obs = observations.join(' ');

    let results = await Promise.all(
      requests.map(async (item, index) => {
        if (item.id !== -1) {
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

          const ITEMS = item.products.map((element) => {
            element.PED_VALOR_UNIT = formataMoedaPFloat(element.VALOR);

            if (element.ESIN_ID !== -1) {
              element.PED_ESIN_ID = element.ESIN_ID;
            }

            delete element.ESIN_ID;

            return {
              PED_ESIN_EMP_ID: element.ESIN_EMP_ID,
              PED_OPER_ID: scheduleData.OPER_ID_CONSIGNACAO_DEV,
              PED_PROD_ID: element.PROD_ID,
              PED_QTDE: element.QTDE_PEDIDO,
              PED_VALOR_UNIT: formataMoedaPFloat(element.VALOR),
              PED_VALOR: formataMoedaPFloat(element.VALOR) * element.QTDE_PEDIDO,
              PED_GEN_ID_TAB_PRECO: scheduleData.GPA_GEN_ID_TAB_PRECO_DEV,
              ...element,
            };
          });

          const Nfs = item.products.map((item) => {
            return item.ESIN_NOTA_FISCAL;
          });

          const ATD_VALOR_TOTAL = ITEMS.reduce(
            (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
            0
          );

          const ATD_QTDE_TOTAL = ITEMS.reduce(
            (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
            0
          );

          const obs = `NF: ${Nfs}, ${item.OBSERVATION || ''}`;

          const sessao = getFromStorage();
          const OPER_ID = scheduleData.OPER_ID_CONSIGNACAO_DEV;

          const res = await handleAddSale(
            null,
            OPER_ID,
            item.emp,
            sessao.codigoUsuario,
            item.id,
            scheduleData.ESTR_ID,
            ATD_VALOR_TOTAL,
            obs,
            ATD_QTDE_TOTAL,
            ITEMS,
            count + index,
            []
          );

          count += 1;
          if (res && res.length > 0) {
            res[0].SEQUENCIA = index;


            res[0].ITEMS = res[0].ITEMS.map(element => {
              element.PED_OBS = res[0].ATD_ID
              return element
            })

            scheduleData.ORDERS.ATD_COD_ATENDIMENTO = count + 1;

            await updateScheduleData(scheduleData)
            return res[0];
          }
        } else {
          return item;
        }
      })
    );

    results = results.filter(Boolean);
    results = results.filter((e) => e?.ATD_ID);
    if (results && results.length > 0) {
      await this.handleFinished(allProducts, obs, count + 1, results);

      this.props.history.push({
        pathname: '/AdminModule',
        state: {
          cliente: cliente,
          pesquisas: pesquisas,
        },
      });
    }


    this.setState({ loading: false });
  };

  handleFinished = async (products, observations, count, results) => {
    const { statusVenda } = this.props.history.location.state;
    const scheduleData = await getScheduleData()
    const sessao = getFromStorage();

    let operationId = scheduleData.OPER_ID_CONSIGNACAO;
    if (statusVenda === 1) {
      operationId = scheduleData.OPER_ID;
    } else if (statusVenda === 2) {
      operationId = scheduleData.OPER_ID_BONIFICACAO;
    }

    const ITEMS = products.map((item) => {
      item.PED_OPER_ID = operationId;

      results.forEach((ele) => {
        const itemRes = ele?.ITEMS?.find((e) => e.PED_PROD_ID === item.PROD_ID && e.PED_ESIN_ID === item.PED_ESIN_ID);
        if (itemRes) {
          item.PED_NR_PEDIDO = itemRes.PED_ID;
          item.PED_OBS = itemRes.PED_OBS;
        }
      });

      if (item.ESIN_ID_VENDA !== -1) {
        item.PED_ESIN_ID = item?.ESIN_ID_VENDA;
      }

      delete item.ESIN_ID;

      return {
        PED_PROD_ID: item?.PROD_ID_VENDA || item.PROD_ID,
        PED_QTDE: item.QTDE_ORDER || item.QTDE_PEDIDO,
        PED_VALOR_UNIT: formataMoedaPFloat(item.VALOR),
        PED_VALOR: formataMoedaPFloat(item.VALOR) * (item.QTDE_ORDER || item.QTDE_PEDIDO),
        SEQUENCIA: item.SEQUENCIA,
        PED_GEN_ID_TAB_PRECO: scheduleData.GPA_GEN_ID_TAB_PRECO,
        PED_ESIN_EMP_ID: item.ESIN_EMP_ID_VENDA || item.ESIN_EMP_ID,
        ...item,
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

    const OPER_ID = operationId;
    const ATD_COD_ATENDIMENTO = count;

    const res = await handleAddSale(
      null,
      OPER_ID,
      sessao.empresaId,
      sessao.codigoUsuario,
      scheduleData.cliAtendimento,
      scheduleData.ESTR_ID,
      ATD_VALOR_TOTAL,
      observations,
      ATD_QTDE_TOTAL,
      ITEMS,
      ATD_COD_ATENDIMENTO,
      []
    );

    this.setState({ loading: false });
    if (res && res.length > 0) {
      res[0].ITEMS = ITEMS;

      scheduleData.ORDERS_DIRECT.INPROGRESS = [...(scheduleData.ORDERS_DIRECT.INPROGRESS || []), res[0]];
      scheduleData.ORDERS.ATD_COD_ATENDIMENTO = count + 1;

      alerta('Pedido feito com sucesso!', 1);

      await updateScheduleData(scheduleData)

      return res[0];
    } else {
      alerta('Não foi possível criar o pedido', 2);
      return { resMain: null, resProducts: [] };
    }
  };

  handleObservation = async (data, index) => {
    const { requests } = this.state;
    requests[index].OBSERVATION = data;

    this.setState({ requests });
  };

  render() {
    const { cliente, pesquisas, loading, requests, view, valueOrder, posInput, order, productsFilter } = this.state;

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
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            className="waves-effect waves-light saib-button is-cancel"
            onClick={() => {
              this.props.history.push({
                pathname: '/OrderDirect',
                state: {
                  cliente: cliente,
                  pesquisas: pesquisas,
                  order,
                  productsFilter,
                },
              });
            }}
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>

          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>
            {view ? 'Visualização do pedido' : 'Novo pedido'}
          </p>
          {requests && requests.length > 0 && !view && (
            <button
              onClick={this.handleSendOrder}
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
            {requests.map((item, indexCompany) => (
              <>
                <div style={{ borderBottom: '1px solid #000' }}>
                  <p style={{ fontWeight: '700', fontSize: '16px' }}>{item.name}</p>
                </div>
                {item.products.map((prod, index) => (
                  <div key={`${prod.PROD_ID}_${prod.SERIE}`}>
                    <div
                      className="card"
                      style={{ fontSize: '16px', borderRadius: '5px', border: '1px solid #8e44ad' }}
                    >
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
                          {prod.CODIGO_INTEGRACAOO || prod.CODIGO || prod.PROD_CODIGO} -{' '}
                          {prod.PRODUTO || prod.PROD_DESCR}
                        </p>
                      </div>
                      <p style={{ padding: '0 0.2rem' }}>
                        <strong>Endereço: </strong>
                        {prod.ENDERECO} - {prod.CIDADE} - {prod.UF}
                      </p>
                      <p style={{ padding: '0 0.2rem' }}>
                        <strong>Lote: </strong> {prod.LOTE}
                      </p>
                      <p style={{ padding: '0 0.2rem' }}>
                        <strong>Série: </strong> {prod.SERIE}
                      </p>
                      <p style={{ padding: '0 0.2rem' }}>
                        <strong>Qtde: </strong> {prod.QTDE_PEDIDO}
                      </p>
                      <div
                        style={{ display: 'flex', alignItems: 'center', padding: '0 0.2rem', marginBottom: '0.5rem' }}
                      >
                        <p>
                          <strong>Valor unitário: </strong> {formatFloatBr(formataMoedaPFloat(prod.VALOR))}
                        </p>
                        {!view && (
                          <Button
                            onClick={() => {
                              this.setState({
                                valueOrder: formatFloatBr(formataMoedaPFloat(prod.VALOR)) || 0,
                                posInput: `${index}_${indexCompany}`,
                              });
                              setTimeout(() => {
                                const doc = document.getElementById(`valor${index}_${indexCompany}`);
                                if (doc) {
                                  document.getElementById(`valor${index}_${indexCompany}`).focus();
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
                      {posInput === `${index}_${indexCompany}` && (
                        <div style={{ padding: '0 0.2rem' }}>
                          <strong style={{ color: '#000', fontSize: '1.2rem', fontWeight: '600' }}>
                            Informe o valor unitário
                          </strong>

                          <input
                            id={`valor${index}_${indexCompany}`}
                            name={`valor${index}_${indexCompany}`}
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
                                await this.handleEditValue(indexCompany, index, prod);
                              }
                            }}
                          />
                          <Button
                            onClick={async () => {
                              await this.handleEditValue(indexCompany, index, prod);
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
                {!view && (
                  <TextAreaDiv>
                    <label style={{ fontWeight: '700', fontSize: '1rem', color: '#000' }}>Observação do pedido</label>
                    <textarea
                      id={indexCompany}
                      onChange={(event) => {
                        this.handleObservation(event.target.value, indexCompany);
                      }}
                      maxLength={300}
                      cols={4}
                    />
                  </TextAreaDiv>
                )}
              </>
            ))}
          </div>
        </Container>
      </>
    );
  }
}

export default withRouter(NewOrderDirect);
