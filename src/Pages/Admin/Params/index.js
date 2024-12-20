import React, { Component } from 'react';
import Header from '../../../Components/System/Header';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import { Button, Checkbox, Icon, Tab, Tabs } from 'react-materialize';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import { Container, Title, Content, LinhaSaveButton, LinhaKey, DivDetalheButtons, ScreenDialog } from './styles';
import { Labels } from '../../FieldWork/TradeMktTeam/style';
import SelectQuery from '../../../Components/Globals/SelectQuery';
import { PaymentsMethods } from './PaymentMethods';
import { AddMethod } from './PaymentMethods/addMethod';

export default class MovelParams extends Component {
  state = {
    loading: false,
    GPA_TOKEN_ERP: undefined,
    GPA_TOKEN_ERP_ATIVO: 0,
    GPA_FLG_ADMINISTRATIVO: 0,
    GPA_FLG_HODOMETRO: 0,
    initialToken: undefined,
    GPA_OPER_ID: 0,
    operaionsList: [],
    listMethodsPayments: [],
    selectTablePrices: [],
    selectedOperation: '',
    selectedBonification: '',
    pageActive: 0,
    GPA_WEBHOOK_PEDIDO: '',
    isOpenFormPayments: false,
    objEditMethod: null
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.getParams();
    await this.getMethodsPayments();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  generateToken = async () => {
    try {
      this.setState({ loading: true });
      let { GPA_TOKEN_ERP } = this.state;
      const url = 'v1/params/gerar/token/erp';

      const res = await api.get(url);
      GPA_TOKEN_ERP = res.data.data;
      alerta('Novo token gerado com sucesso', 1);

      this.setState({
        GPA_TOKEN_ERP,
        loading: false,
      });
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar chave => ` + err);
    }
  };

  getParams = async () => {
    try {
      this.setState({ loading: true });
      let { GPA_TOKEN_ERP, GPA_TOKEN_ERP_ATIVO, GPA_FLG_ADMINISTRATIVO, GPA_FLG_HODOMETRO, GPA_WEBHOOK_PEDIDO } =
        this.state;
      const url = 'v1/params';

      const res = await api.get(url);

      let operaionsList = [];

      const operations = await api.get('v1/params/operations');

      operations.data.data.forEach((operation) => {
        operaionsList.push({
          operator: operation.OPER_ID,
          name: operation.OPER_DESCR,
          label: `${operation.OPER_CODIGO} - ${operation.OPER_DESCR}`,
        });
      });

      const { data } = res.data;

      if (data) {
        GPA_WEBHOOK_PEDIDO = data.GPA_WEBHOOK_PEDIDO;
        GPA_TOKEN_ERP = data.GPA_TOKEN_ERP;
        GPA_TOKEN_ERP_ATIVO = data.GPA_TOKEN_ERP_ATIVO;
        GPA_FLG_ADMINISTRATIVO = data.GPA_FLG_ADMINISTRATIVO;
        GPA_FLG_HODOMETRO = data.GPA_FLG_HODOMETRO;
        let selectTablePrices = [];

        if (data.GPA_FLG_ADMINISTRATIVO) {
          const operationsPrices = await api.get('v1/params/prices_tables');

          const dataPrices = operationsPrices.data.data;
          dataPrices.forEach((item) => {
            selectTablePrices.push({
              id: item.GEN_ID,
              name: item.GEN_DESCRICAO,
              label: `${item.GEN_CODIGO} - ${item.GEN_DESCRICAO}`,
            });
          });
        }

        this.setState({
          GPA_TOKEN_ERP,
          GPA_TOKEN_ERP_ATIVO,
          GPA_FLG_ADMINISTRATIVO,
          GPA_FLG_HODOMETRO,
          initialToken: GPA_TOKEN_ERP,
          loading: false,
          operaionsList,
          selectedOperation: data.GPA_OPER_ID,
          selectedOperationConsignado: data.GPA_OPER_ID_CONSIGNACAO,
          selectedOperationConsignadoCancel: data.GPA_OPER_ID_CONSIGNACAO_DEV,
          selectedTablePrice: data.GPA_GEN_ID_TAB_PRECO,
          selectedTablePriceCancel: data.GPA_GEN_ID_TAB_PRECO_DEV,
          selectedBonification: data.GPA_OPER_ID_BONIFICACAO,
          GPA_WEBHOOK_PEDIDO: GPA_WEBHOOK_PEDIDO === null || GPA_WEBHOOK_PEDIDO === 'null' ? '' : GPA_WEBHOOK_PEDIDO,
          selectTablePrices,
        });
      }
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar chave => ` + err);
    } finally {
      this.setState({ loading: false });
    }
  };

  getMethodsPayments = async () => {
    try {
      this.setState({ loading: true });
      const res = await api.get(`v1/payments_conditions`);

      const { data } = res.data;

      if (data && data.length > 0) {
        this.setState({ listMethodsPayments: data });
      }
    } catch (error) {
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSelectOperation = (value) => {
    let { selectedOperation } = this.state;
    if (value) {
      selectedOperation = value.operator;

      this.setState({
        selectedOperation,
      });
    } else {
      this.setState({
        selectedSeller: '',
      });
    }
  };
  handleSelectOperationConsignado = (value) => {
    let { selectedOperationConsignado } = this.state;

    if (value) {
      selectedOperationConsignado = value.operator;

      this.setState({
        selectedOperationConsignado,
      });
    } else {
      this.setState({
        selectedOperationConsignado: '',
      });
    }
  };
  handleSelectOperationConsignadoCancel = (value) => {
    let { selectedOperationConsignadoCancel } = this.state;
    if (value) {
      selectedOperationConsignadoCancel = value.operator;

      this.setState({
        selectedOperationConsignadoCancel,
      });
    } else {
      this.setState({
        selectedOperationConsignadoCancel: '',
      });
    }
  };

  handleSelectTablePrice = (value) => {
    let { selectedTablePrice } = this.state;
    if (value) {
      selectedTablePrice = value.id;

      this.setState({
        selectedTablePrice,
      });
    } else {
      this.setState({
        selectedTablePrice: '',
      });
    }
  };
  handleSelectTablePriceCancel = (value) => {
    let { selectedTablePriceCancel } = this.state;
    if (value) {
      selectedTablePriceCancel = value.id;

      this.setState({
        selectedTablePriceCancel,
      });
    } else {
      this.setState({
        selectedTablePriceCancel: '',
      });
    }
  };

  handleSelectBonification = (value) => {
    let { selectedBonification } = this.state;
    if (value) {
      selectedBonification = value.operator;

      this.setState({
        selectedBonification,
      });
    } else {
      this.setState({
        selectedBonification: '',
      });
    }
  };

  saveParams = async () => {
    const { initialToken } = this.state;
    try {
      this.setState({ loading: true });
      const {
        GPA_TOKEN_ERP,
        GPA_TOKEN_ERP_ATIVO,
        GPA_FLG_ADMINISTRATIVO,
        GPA_FLG_HODOMETRO,
        selectedOperation,
        selectedOperationConsignado,
        selectedOperationConsignadoCancel,
        selectedTablePrice,
        selectedTablePriceCancel,
        GPA_WEBHOOK_PEDIDO,
        selectedBonification,
      } = this.state;

      const url = 'v1/params';
      const data = {
        GPA_TOKEN_ERP,
        GPA_TOKEN_ERP_ATIVO,
        GPA_FLG_ADMINISTRATIVO,
        GPA_FLG_HODOMETRO,
        GPA_OPER_ID: selectedOperation,
        GPA_OPER_ID_CONSIGNACAO: selectedOperationConsignado,
        GPA_OPER_ID_CONSIGNACAO_DEV: selectedOperationConsignadoCancel,
        GPA_GEN_ID_TAB_PRECO: selectedTablePrice,
        GPA_GEN_ID_TAB_PRECO_DEV: selectedTablePriceCancel,
        GPA_OPER_ID_BONIFICACAO: selectedBonification,
        GPA_WEBHOOK_PEDIDO,
      };

      const res = await api.post(url, data);

      if (res.data.sucess) {
        if (initialToken === GPA_TOKEN_ERP) {
          this.setState({ loading: false });
          alerta('Parâmetros alterados com sucesso!', 1);
          return this.props.history.push('/home');
        }
        this.setState({ loading: false });
        alerta('Token salvo com sucesso', 1);
        this.props.history.push('/home');
      }
    } catch (err) {
      this.setState({ loading: false });
      alerta(`Erro ao carregar chave => ` + err);
    }
  };

  onChangeSearchActive = (e) => {
    let { GPA_TOKEN_ERP_ATIVO } = this.state;

    if (e.target.checked) {
      GPA_TOKEN_ERP_ATIVO = 1;
      this.setState({
        GPA_TOKEN_ERP_ATIVO,
      });
    } else {
      GPA_TOKEN_ERP_ATIVO = 0;
      this.setState({
        GPA_TOKEN_ERP_ATIVO,
      });
    }
  };

  onChangeAdmin = (e) => {
    let { GPA_FLG_ADMINISTRATIVO } = this.state;
    if (e.target.checked) {
      GPA_FLG_ADMINISTRATIVO = 1;
      return this.setState({
        GPA_FLG_ADMINISTRATIVO,
      });
    }
    GPA_FLG_ADMINISTRATIVO = 0;
    this.setState({
      GPA_FLG_ADMINISTRATIVO,
    });
  };

  onChangeHodometro = (e) => {
    if (e.target.checked) {
      this.setState({
        GPA_FLG_HODOMETRO: 1,
      });
    } else {
      this.setState({
        GPA_FLG_HODOMETRO: 0,
      });
    }
  };

  handlePagePerTabs = (ev) => {
    const linkOfPageElement = ev.target;
    const numberPage = linkOfPageElement.href.substr(linkOfPageElement.href.length - 1, linkOfPageElement.href.length);
    this.setState({
      pageActive: parseInt(numberPage),
    });
  };

  render() {
    const {
      GPA_TOKEN_ERP,
      GPA_TOKEN_ERP_ATIVO,
      GPA_FLG_ADMINISTRATIVO,
      GPA_FLG_HODOMETRO,
      loading,
      selectedOperation,
      selectedOperationConsignado,
      selectedOperationConsignadoCancel,
      operaionsList,
      pageActive,
      GPA_WEBHOOK_PEDIDO,
      selectTablePrices,
      selectedTablePrice,
      selectedTablePriceCancel,
      selectedBonification,
      isOpenFormPayments,
      listMethodsPayments,
      objEditMethod
    } = this.state;

    return (
      <>
        <WaitScreen loading={loading} />
        <Header />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={<span style={{ display: 'flex', alignItems: 'center' }}>Parâmetros / API</span>}
          />
          <Tabs
            scope="tabs"
            className="tabs-content"
            onChange={(ev) => {
              this.handlePagePerTabs(ev);
            }}
          >
            <Tab
              tabWidth={200}
              className="element"
              active={pageActive === 0}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'ERP'}
            >
              <Title style={{ fontSize: '20px', marginTop: '10px' }}>Seu token atual é:</Title>
              <LinhaKey>
                <textarea disabled={true} value={GPA_TOKEN_ERP} />
                <DivDetalheButtons>
                  <Checkbox
                    id="Checkbox_3"
                    label={GPA_TOKEN_ERP_ATIVO && GPA_TOKEN_ERP_ATIVO === 1 ? 'Token ativo' : 'Token inativo'}
                    value={String(GPA_TOKEN_ERP_ATIVO)}
                    checked={GPA_TOKEN_ERP_ATIVO && GPA_TOKEN_ERP_ATIVO === 1 ? true : false}
                    onChange={this.onChangeSearchActive}
                  />
                  <button
                    type="submit"
                    onClick={() => {
                      this.generateToken();
                    }}
                  >
                    <Icon tiny>vpn_key</Icon>Gerar token
                  </button>
                </DivDetalheButtons>
              </LinhaKey>
            </Tab>
            <Tab
              tabWidth={200}
              className="tabClient"
              active={pageActive === 1}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'Administrativo'}
            >
              <LinhaKey style={{ marginTop: '0.4rem' }}>
                <DivDetalheButtons>
                  <Checkbox
                    id="Checkbox_2"
                    label={'Módulo Administrativo'}
                    value={String(GPA_FLG_ADMINISTRATIVO)}
                    checked={GPA_FLG_ADMINISTRATIVO && GPA_FLG_ADMINISTRATIVO === 1 ? true : false}
                    onClick={this.onChangeAdmin}
                  />
                </DivDetalheButtons>
                <DivDetalheButtons>
                  <Checkbox
                    id="Checkbox_Hodometro"
                    label={'Hodômetro'}
                    value={String(GPA_FLG_HODOMETRO)}
                    checked={GPA_FLG_HODOMETRO && GPA_FLG_HODOMETRO === 1 ? true : false}
                    onClick={this.onChangeHodometro}
                  />
                </DivDetalheButtons>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                  <Labels>Operação</Labels>
                  <SelectQuery
                    inputName="selectSeller"
                    loading={false}
                    itemSelected={selectedOperation}
                    colorPrimary
                    query={operaionsList}
                    keys={['ESTR_COD_ROTA', 'operator']}
                    label="label"
                    onSelect={this.handleSelectOperation}
                    onDelete={this.handleSelectOperation}
                  />
                </div>
                {GPA_FLG_ADMINISTRATIVO && (
                  <>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                      <Labels>Operação de consignado</Labels>
                      <SelectQuery
                        inputName="selectSeller"
                        loading={false}
                        itemSelected={selectedOperationConsignado}
                        colorPrimary
                        query={operaionsList}
                        keys={['ESTR_COD_ROTA', 'operator']}
                        label="label"
                        onSelect={this.handleSelectOperationConsignado}
                        onDelete={this.handleSelectOperationConsignado}
                      />
                    </div>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                      <Labels>Operação de consignado (cancelamento)</Labels>
                      <SelectQuery
                        inputName="selectSeller"
                        loading={false}
                        itemSelected={selectedOperationConsignadoCancel}
                        colorPrimary
                        query={operaionsList}
                        keys={['ESTR_COD_ROTA', 'operator']}
                        label="label"
                        onSelect={this.handleSelectOperationConsignadoCancel}
                        onDelete={this.handleSelectOperationConsignadoCancel}
                      />
                    </div>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                      <Labels>Operação de bonificação</Labels>
                      <SelectQuery
                        inputName="selectTableBonification"
                        loading={false}
                        itemSelected={selectedBonification}
                        colorPrimary
                        query={operaionsList}
                        keys={['ESTR_COD_ROTA', 'operator']}
                        label="label"
                        onSelect={this.handleSelectBonification}
                        onDelete={this.handleSelectBonification}
                      />
                    </div>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                      <Labels>Tabela de preço</Labels>
                      <SelectQuery
                        inputName="selectTablePrice"
                        loading={false}
                        itemSelected={selectedTablePrice}
                        colorPrimary
                        query={selectTablePrices}
                        keys={['name', 'id']}
                        label="label"
                        onSelect={this.handleSelectTablePrice}
                        onDelete={this.handleSelectTablePrice}
                      />
                    </div>
                    <div style={{ maxWidth: '400px', width: '100%' }}>
                      <Labels>Tabela de preço (devolução)</Labels>
                      <SelectQuery
                        inputName="selectTablePriceDev"
                        loading={false}
                        itemSelected={selectedTablePriceCancel}
                        colorPrimary
                        query={selectTablePrices}
                        keys={['name', 'id']}
                        label="label"
                        onSelect={this.handleSelectTablePriceCancel}
                        onDelete={this.handleSelectTablePriceCancel}
                      />
                    </div>
                  </>
                )}

                <div style={{ maxWidth: '400px', width: '100%' }}>
                  <Labels style={{ color: '#858585' }}>Webhook do pedido</Labels>
                  <input
                    style={{ borderColor: 'rgba(133, 133, 128, 0.4)' }}
                    type="text"
                    value={GPA_WEBHOOK_PEDIDO}
                    onChange={(ev) => {
                      this.setState({ GPA_WEBHOOK_PEDIDO: ev.target.value });
                    }}
                  />
                </div>
              </LinhaKey>
            </Tab>
            <Tab
              tabWidth={200}
              className="element"
              active={pageActive === 2}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'Formas de pagamento'}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                  borderBottom: '1px solid #d9d9d9',
                  padding: '0.5rem 0',
                }}
              >
                <Button
                  onClick={() => this.setState({ isOpenFormPayments: true })}
                  className="waves-effect waves-light saib-button is-primary"
                >
                  <Icon>add</Icon> Adicionar forma de pagamento
                </Button>
              </div>
              <PaymentsMethods data={listMethodsPayments} onEdit={(res) => this.setState({ isOpenFormPayments: true, objEditMethod: res })}  />
              {isOpenFormPayments && (
                <ScreenDialog>
                  <div
                    style={{ zIndex: '50', background: '#fff', borderRadius: '4px', padding: '0.5rem', width: '92%' }}
                  >
                    <AddMethod
                      onClosed={() => this.setState({ isOpenFormPayments: false, objEditMethod: null })}
                      onSaved={async () => {
                        await this.getMethodsPayments();
                        this.setState({ isOpenFormPayments: false, objEditMethod: null });
                      }}
                      editFields={objEditMethod}
                    />
                  </div>
                </ScreenDialog>
              )}
            </Tab>
          </Tabs>
          {pageActive !== 2 && (
            <Content style={{ marginTop: '10px' }}>
              <LinhaSaveButton>
                <button
                  type="submit"
                  onClick={() => {
                    this.saveParams();
                  }}
                >
                  <Icon>save</Icon> Salvar
                </button>
              </LinhaSaveButton>
            </Content>
          )}
        </Container>
      </>
    );
  }
}
