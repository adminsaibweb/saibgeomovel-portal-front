import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Labels,
  Container,
  Linha,
  DivDetalhe,
  DivDetalheItems,
  Titulo,
  TdTitle,
  ProductCard,
} from './style';
import { getFromStorage } from '../../../services/auth';
import api from '../../../services/api';
import { alerta, getCurrentDate } from '../../../services/funcoes';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import truck from '../../../assets/images/truck.png';
import truckExclamation from '../../../assets/images/truck-exclamation.png';
import truckChecked from '../../../assets/images/truck-checked.png';
import downArrow from '../../../assets/images/seta-baixo.png';
import {
  getLocalObject,
  setLocalObject,
} from '../../../services/databaseLocal';
import './forced.css';
import { currencyFormat } from '../../../services/funcoes';
import Dialog from '../../../Components/Globals/Question';
import ConfirmarChegada from './ConfirmarChegada';
import ConfirmarFinalizar from './ConfirmarFinalizar';
import ConfirmarAcerto from './ConfirmarAcerto';
import ConfirmarRetornavel from './ConfirmarRetornavel';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import FecharRota from './FecharRota';

const NumeroEntregas = (props) => {
  return (
    <>
      <DivDetalhe className="logisticsIndicator">
        <img
          className="logisticsImage"
          src={
            props.type === '0'
              ? truck
              : props.type === '1'
              ? truckChecked
              : truckExclamation
          }
          alt="Nº entregas"
          width={'32px'}
        />
        <p className="logisticsQtde">{props.qtde}</p>
        <p className="logisticsLabel">
          {props.type === '0'
            ? 'N.Entregas'
            : props.type === '1'
            ? 'Realizadas'
            : 'Faltam'}
        </p>
      </DivDetalhe>
    </>
  );
};

const SemEntregas = (props) => {
  return (
    <Linha style={{ justifyContent: 'center', marginTop: '20px' }}>
      <DivDetalhe
        className="logisticsIndicator"
        style={{
          maxHeight: '74px',
          maxWidth: '116px',
        }}
      >
        <img
          className="logisticsImage"
          src={truckExclamation}
          alt="Sem entregar"
          width={'32px'}
        />
        <p
          className="logisticsLabel"
          style={{
            marginTop: '10px',
            fontWeight: '700',
            lineHeight: '1rem',
          }}
        >
          Sem entregas para esta frota
        </p>
      </DivDetalhe>
    </Linha>
  );
};

const OutraRotaIniciada = (props) => {
  return (
    <Linha style={{ justifyContent: 'center', marginTop: '20px' }}>
      <DivDetalhe
        className="logisticsIndicator"
        style={{
          maxHeight: '74px',
          maxWidth: '200px',
        }}
      >
        <img
          className="logisticsImage"
          src={truckExclamation}
          alt="Sem entregar"
          width={'32px'}
        />
        <p className="logisticsQtde" style={{ marginTop: '20px' }}>
          A frota {props.frotaId}
        </p>
        <p
          className="logisticsLabel"
          style={{ textTransform: 'none', marginTop: '2px' }}
        >
          Já foi iniciada, finalize-a.
        </p>
      </DivDetalhe>
    </Linha>
  );
};

/*
{
  statusEntrega :
  -1 - Entrega cancelada
   0 - Pendente
   1 - Chegada confirmada
   2 - Retorno vasilhame confirmado
   3 - Entrega confirmada e acertada
}
 */

const Atender = (props) => {
  return (
    <>
      <Titulo style={{ justifyContent: 'flex-start', paddingLeft: '15px' }}>
        <Icon className="modal-close" style={{ cursor: 'pointer' }}>
          arrow_back
        </Icon>
        <p style={{ position: 'unset', top: 'unset', width: '100%' }}>
          {' '}
          Entregar pedido
        </p>
      </Titulo>
      <Linha
        style={{
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '10px',
        }}
      >
        <Labels fontSize="1.1rem" fontWeight="700">
          {props.data.CODIGO + ' - ' + props.data.DESCRICAO}
        </Labels>
      </Linha>
      <Linha
        style={{
          width: '100%',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '-1px 1px 5px 1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Linha
          style={{
            alignItems: 'center',
            padding: '10px 0px',
            flexDirection: 'column',
            color: '#8e44ad',
            maxWidth: '350px',
          }}
        >
          <ConfirmarChegada
            data={props.data}
            onUpdateItem={props.onUpdateItem}
            onUpdateItemProdutoRetorno={props.onUpdateItemProdutoRetorno}
            handleAppFormaPagamento={props.handleAppFormaPagamento}
            handleDeleteFormaPagamento={props.handleDeleteFormaPagamento}
          />
          {props.data.items[0].produtos.find(
            (_prod) =>
              _prod.PROD_EMB_1_ID !== null || _prod.PROD_EMB_2_ID !== null
          ) && (
            <>
              <img
                src={downArrow}
                width={'32'}
                heigth={'32'}
                alt="Seta para baixo"
                style={{ margin: '5px' }}
              />
              <ConfirmarRetornavel
                data={props.data}
                onUpdateItem={props.onUpdateItem}
                onUpdateItemProdutoRetorno={props.onUpdateItemProdutoRetorno}
                handleAppFormaPagamento={props.handleAppFormaPagamento}
                handleDeleteFormaPagamento={props.handleDeleteFormaPagamento}
              />
            </>
          )}
          <img
            src={downArrow}
            width={'32'}
            heigth={'32'}
            alt="Seta para baixo"
            style={{ margin: '5px' }}
          />
          <ConfirmarAcerto
            data={props.data}
            onUpdateItem={props.onUpdateItem}
            handleAppFormaPagamento={props.handleAppFormaPagamento}
            handleDeleteFormaPagamento={props.handleDeleteFormaPagamento}
          />
          <img
            src={downArrow}
            width={'32'}
            heigth={'32'}
            alt="Seta para baixo"
            style={{ margin: '5px' }}
          />
          <ConfirmarFinalizar
            data={props.data}
            onUpdateItem={props.onUpdateItem}
            handleAppFormaPagamento={props.handleAppFormaPagamento}
            handleDeleteFormaPagamento={props.handleDeleteFormaPagamento}
            onFinalizarEntrega={props.onFinalizarEntrega}
          />
        </Linha>
      </Linha>
    </>
  );
};

const ContaCorrenteRetornavel = (props) => {
  return (
    <>
      <Titulo
        style={{
          justifyContent: 'flex-start',
          paddingLeft: '15px',
        }}
      >
        <Icon className="modal-close" style={{ cursor: 'pointer' }}>
          arrow_back
        </Icon>
        <p
          style={{
            position: 'unset',
            top: 'unset',
            width: '100%',
          }}
        >
          {' '}
          Conta corrente retornável
        </p>
      </Titulo>
      <Linha
        style={{ borderBottom: '2px solid #bf1f7c', paddingBottom: '16px' }}
      >
        <SaibRadioGroup
          valueItems={'"TOD","ENT","SAI"'}
          classNameItems={
            '"itemTodosContaCorrente","itemEntregaContaCorrente","itemRetornoContaCorrente"'
          }
          textItems={'"Todos","Entrada","Saída"'}
          idItems={
            '"itemTodosContaCorrente","itemEntregaContaCorrente","itemRetornoContaCorrente"'
          }
          classNameRadio="filtrarContaCorrente"
          flexDirectionRadio="row"
          disabledRadio="false"
          captionRadio=""
          defaultCheckedId={'itemTodosContaCorrente'}
          onChange={(e) => props.onChangeFiltroExtrato(e)}
        />
      </Linha>
      <Linha
        style={{
          fontWeight: '700',
          paddingBottom: '5px',
          paddingTop: '-35px',
          color: '#858585',
        }}
      >
        <DivDetalhe style={{ padding: '0px', width: '62%' }}>
          Produto
        </DivDetalhe>
        <DivDetalhe style={{ padding: '0px', width: '20%' }}>Data</DivDetalhe>
        <DivDetalhe style={{ padding: '0px', width: '8%' }}>E/S</DivDetalhe>
        <DivDetalhe
          style={{ padding: '0px', width: '10%', textAlign: 'right' }}
        >
          Qtd
        </DivDetalhe>
      </Linha>
      <Collapsible
        accordion={false}
        className="extratoProdutos"
        style={{
          width: '100%',
          borderStyle: 'none',
          boxShadow: 'none',
        }}
      >
        {props.data !== undefined &&
          props.data.map((item) => (
            <CollapsibleItem
              style={{
                display:
                  props.filtroExtrato === 'TOD' ||
                  props.filtroExtrato === item.TIPO
                    ? 'block'
                    : 'none',
              }}
              expanded={false}
              header={
                <>
                  <Labels
                    fontSize="0.9rem"
                    fontWeight="500"
                    style={{ width: '56%' }}
                  >
                    {item.NOME_PRODUTO.toLowerCase()}
                  </Labels>
                  <Labels
                    fontSize="0.9rem"
                    fontWeight="500"
                    style={{ width: '21%' }}
                  >
                    {item.DATA_EMISSAO}
                  </Labels>
                  <Labels
                    fontSize="0.9rem"
                    fontWeight="500"
                    style={{ width: '3%' }}
                  >
                    {item.TIPO.substr(0, 1).toUpperCase()}
                  </Labels>
                  <Labels
                    fontSize="0.9rem"
                    fontWeight="500"
                    style={{ textAlign: 'right', width: '14%' }}
                  >
                    {item.QUANTIDADE}
                  </Labels>
                </>
              }
              icon={
                <>
                  <li className="material-icons plus">add_circle_outline</li>
                  <li className="material-icons minus">
                    remove_circle_outline
                  </li>
                </>
              }
              node="div"
            >
              <Linha
                style={{
                  justifyContent: 'space-between',
                  paddingBottom: '10px',
                }}
              >
                <DivDetalhe style={{ width: '80%', padding: '0px' }}>
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'700'}
                    style={{ paddingBottom: '2px' }}
                  >
                    Produto
                  </Labels>
                  <Labels fontSize={'0.9rem'} fontWeight={'500'} width={'100%'}>
                    {item.NOME_PRODUTO.toLowerCase()}
                  </Labels>
                </DivDetalhe>
                <DivDetalhe
                  style={{ width: '20%', padding: '0px', textAlign: 'right' }}
                >
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'700'}
                    style={{ paddingBottom: '2px' }}
                  >
                    Quantidade
                  </Labels>
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'500'}
                    style={{ padding: '0px', textAlign: 'right' }}
                  >
                    {item.QUANTIDADE}
                  </Labels>
                </DivDetalhe>
              </Linha>
              <Linha
                style={{
                  justifyContent: 'space-between',
                  paddingBottom: '30px',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <DivDetalhe style={{ width: '80%', padding: '0px' }}>
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'700'}
                    style={{ paddingBottom: '2px' }}
                  >
                    Data
                  </Labels>
                  <Labels fontSize={'0.9rem'} fontWeight={'500'} width={'100%'}>
                    {item.DATA_EMISSAO}
                  </Labels>
                </DivDetalhe>
                <DivDetalhe
                  style={{ width: '20%', padding: '0px', textAlign: 'right' }}
                >
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'700'}
                    style={{ paddingBottom: '2px' }}
                  >
                    Nº Docum.
                  </Labels>
                  <Labels
                    fontSize={'0.9rem'}
                    fontWeight={'500'}
                    style={{ padding: '0px', textAlign: 'right' }}
                  >
                    {item.CONTRATO}
                  </Labels>
                </DivDetalhe>
              </Linha>
            </CollapsibleItem>
          ))}
      </Collapsible>
    </>
  );
};

class LogisticsHome extends Component {
  state = {
    alertLocalStarted:
      this.props.reducer[0] === undefined
        ? false
        : this.props.reducer[0].alertLocalStarted,
    driverData:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].driverData,
    empresaAtiva:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].empresaAtiva,
    empresaCfId:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].empresaCfId,
    filtroExtrato:
      this.props.reducer[0] === undefined
        ? 'TOD'
        : this.props.reducer[0].filtroExtrato,
    frotaId:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].frotaId,
    interval:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].interval,
    itemSelecionado:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].itemSelecionado,
    itemsData:
      this.props.reducer[0] === undefined
        ? undefined
        : this.props.reducer[0].itemsData,
    loading:
      this.props.reducer[0] === undefined
        ? false
        : this.props.reducer[0].loading,
    statusEntrega:
      this.props.reducer[0] === undefined
        ? '0'
        : this.props.reducer[0].statusEntrega,
    totalEntregas:
      this.props.reducer[0] === undefined
        ? 0
        : this.props.reducer[0].totalEntregas,
    totalEntregues:
      this.props.reducer[0] === undefined
        ? 0
        : this.props.reducer[0].totalEntregues,
    totalPendentes:
      this.props.reducer[0] === undefined
        ? 0
        : this.props.reducer[0].totalPendentes,
    usuarioAtivo:
      this.props.reducer[0] === undefined
        ? 0
        : this.props.reducer[0].usuarioAtivo,
  };

  componentDidMount = async () => {
    if (this.props.reducer[0] !== undefined) {
      return;
    }
    await this.carregarVariaveisEstado();
    await this.loadDriverData();
  };

  handleSaveState = (state) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'STORE',
      state,
    });
  };

  carregarVariaveisEstado = async (e) => {
    //console.log(this.props);
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      frotaId: sessao.frotaId,
    });
  };

  loadDriverData = async () => {
    try {
      //console.log('loadDriverData');
      let { empresaAtiva, frotaId, alertLocalStarted } = this.state;
      const tableToStorage = 'driverData';
      let tableData = await getLocalObject(tableToStorage);
      if (tableData !== undefined && tableData.REN_FLG_STATUS !== 0) {
        alertLocalStarted =
          tableData.FRT_ID !== Number(frotaId) &&
          tableData.REN_FLG_STATUS !== 0;
        let driverData = tableData;
        //console.log('driverData');
        //console.log(driverData);
        this.setState({ driverData, alertLocalStarted });
        this.loadItemsData();
        return;
      } else {
        tableData = undefined;
      }

      const url = '/v1/logistics/driver/' + empresaAtiva + '/' + frotaId;
      const retorno = await api.get(url);
      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let driverData = retorno.data.data[0];
          if (driverData !== undefined) {
            alertLocalStarted = false;
            await setLocalObject(tableToStorage, driverData);
            this.setState({ driverData, alertLocalStarted });
            this.loadItemsData();
          }
        } else {
          this.setState({ driverData: [] });
        }
      }
    } catch (err) {
      alerta('Erro ao carregar os dados do motorista =>' + err);
      return [];
    }
  };

  indicatorsItems = async () => {
    let { itemsData } = this.state;

    let totalEntregas = 0;
    let totalEntregues = 0;
    let totalPendentes = 0;

    for (const item of itemsData) {
      totalEntregas += 1;
      totalEntregues += item.ENTREGUE != null ? 1 : 0;
      totalPendentes += item.ENTREGUE == null ? 1 : 0;
    }

    this.setState({ totalEntregas, totalEntregues, totalPendentes });
  };

  loadItemsData = async () => {
    try {
      //console.log('loadItemsData');
      const { empresaAtiva, frotaId, driverData } = this.state;
      const tableToStorage = 'itemsData';
      let tableData = await getLocalObject(tableToStorage);
      if (tableData !== undefined && driverData.REN_FLG_STATUS !== 0) {
        let itemsData = tableData;
        this.setState({ itemsData });
        this.indicatorsItems();
        return;
      }

      const url = '/v1/logistics/items/' + empresaAtiva + '/' + frotaId;
      const retorno = await api.get(url);
      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let itemsData = retorno.data.data;
          //console.log('itemsData');
          //console.log(itemsData);
          this.setState({ itemsData });
          this.indicatorsItems();

          /*           se já iniciou a rota então devo salvar no banco local
          os itens, utilizo o timer para dar tempo de atualizar
          a variável de estado itemsData
 */

          if (driverData.REN_FLG_STATUS !== 0) {
            this.onUpdateItemsData(itemsData);
          }
        } else {
          this.setState({ driverData: [] });
        }
      }
    } catch (err) {
      alerta('Erro ao carregar os dados do motorista =>' + err);
      return [];
    }
  };

  onUpdateItemsData = async (itemsData) => {
    const tableToStorage = 'itemsData';
    await setLocalObject(tableToStorage, itemsData);
  };

  onUpdateItem = (item) => {
    let { itemsData } = this.state;
    // const _item = itemsData.find((it) => it.items[0].CODIGO === item.items[0].CODIGO);
    let _itemsData = itemsData.filter(
      (it) => it.items[0].CODIGO !== item.items[0].CODIGO
    );
    _itemsData.push(item);
    this.setState({ itemsData });
    this.indicatorsItems();
    this.onUpdateItemsData(itemsData);
  };

  onUpdateItemProduto = (qtde, codigoEntrega, codigoProduto, statusItem) => {
    let { itemsData } = this.state;
    //console.log(qtde);
    //console.log(codigoEntrega);
    //console.log(codigoProduto);
    let _item = itemsData.find((it) => it.items[0].CODIGO === codigoEntrega);
    for (const _produto of _item.items[0].produtos) {
      if (_produto.PRODUTO === codigoProduto) {
        _produto.qtdeEntregue = qtde;
        _produto.statusItem = statusItem;
      }
    }
    this.setState({ itemsData });
    this.onUpdateItemsData(itemsData);
  };

  onFinalizarEntrega = (dataItem) => {
    let { itemsData } = this.state;
    // //console.log('dataItem');
    // //console.log(dataItem);
    let novoExtrato;
    let _item = itemsData.find(
      (it) => it.items[0].CODIGO === dataItem.items[0].CODIGO
    );
    if (
      dataItem.items[0].produtos.find((produto) => {
        return produto.PROD_EMB_1_ID != null || produto.PROD_EMB_2_ID != null;
      }) !== undefined
    ) {
      for (const produto of dataItem.items[0].produtos) {
        if (
          produto.PROD_EMB_1_ID != null &&
          produto.PROD_EMB_1_QTDE_ENTREGUE > 0
        ) {
          novoExtrato = {};
          novoExtrato.ID_PRODUTO = produto.PROD_EMB_1_ID;
          novoExtrato.NOME_PRODUTO = produto.PROD_EMB_1_DESCR;
          novoExtrato.CODIGO_PRODUTO = produto.PROD_EMB_1_ID;
          novoExtrato.COM_CLI_ID = dataItem.CLI_ID;
          novoExtrato.COM_EMP_ID = dataItem.items[0].EMPRESA;
          novoExtrato.CONTRATO = dataItem.CODIGO_ENTREGA;
          novoExtrato.DATA_EMISSAO = getCurrentDate();
          novoExtrato.TIPO =
            produto.PROD_EMB_1_QTDE_ENTREGUE_STATUS === 1 ? 'ENT' : 'SAI';
          novoExtrato.QUANTIDADE = produto.PROD_EMB_1_QTDE_ENTREGUE;
          _item.extrato.push(novoExtrato);
        }

        if (
          produto.PROD_EMB_2_ID != null &&
          produto.PROD_EMB_2_QTDE_ENTREGUE > 0
        ) {
          novoExtrato = {};
          novoExtrato.ID_PRODUTO = produto.PROD_EMB_2_ID;
          novoExtrato.NOME_PRODUTO = produto.PROD_EMB_2_DESCR;
          novoExtrato.CODIGO_PRODUTO = produto.PROD_EMB_2_ID;
          novoExtrato.COM_CLI_ID = dataItem.CLI_ID;
          novoExtrato.COM_EMP_ID = dataItem.items[0].EMPRESA;
          novoExtrato.CONTRATO = dataItem.CODIGO_ENTREGA;
          novoExtrato.DATA_EMISSAO = getCurrentDate();
          novoExtrato.TIPO =
            produto.PROD_EMB_2_QTDE_ENTREGUE_STATUS === 1 ? 'ENT' : 'SAI';
          novoExtrato.QUANTIDADE = produto.PROD_EMB_2_QTDE_ENTREGUE;
          _item.extrato.push(novoExtrato);
        }

        // //console.log('_item.extrato');
        // //console.log(_item.extrato);
      }
    }
    _item.statusEntrega = dataItem.statusEntrega;
    _item.ENTREGUE = dataItem.ENTREGUE;
    // //console.log('_item');
    // //console.log(_item);
    this.setState({ itemsData });
    this.indicatorsItems();
    this.onUpdateItemsData(itemsData);
  };

  onUpdateItemProdutoRetorno = (
    item,
    qtde,
    codigoEntrega,
    codigoProduto,
    statusItem
  ) => {
    let { itemsData } = this.state;
    //console.log(qtde);
    //console.log(codigoEntrega);
    //console.log(codigoProduto);
    let _item = itemsData.find((it) => it.items[0].CODIGO === codigoEntrega);
    for (const _produto of _item.items[0].produtos) {
      if (_produto.PRODUTO === codigoProduto) {
        if (item === 1) {
          _produto.PROD_EMB_1_QTDE_ENTREGUE = statusItem === 0 ? 0 : qtde;
          _produto.PROD_EMB_1_QTDE_ENTREGUE_STATUS = statusItem;
        }
        if (item === 2) {
          _produto.PROD_EMB_2_QTDE_ENTREGUE = statusItem === 0 ? 0 : qtde;
          _produto.PROD_EMB_2_QTDE_ENTREGUE_STATUS = statusItem;
        }
      }
    }
    this.setState({ itemsData });
    this.onUpdateItemsData(itemsData);
  };

  handleAppFormaPagamento = (value, formaPagamento, codigoEntrega) => {
    let { itemsData } = this.state;
    let item = itemsData.find((_item) => _item.CODIGO === codigoEntrega);
    if (item.pagamentos === undefined) {
      item.valorAcertado = 0;
      item.pagamentos = [];
    }

    const encontrei = item.pagamentos.find((pg) => {
      return pg.formaPagamento === formaPagamento;
    });

    if (encontrei === undefined) {
      let pgto = {};
      pgto.id = Math.floor(Math.random() * 100000 + 1);
      pgto.formaPagamento = formaPagamento;
      pgto.valor = value;
      item.pagamentos.push(pgto);
      item.valorAcertado += value;
    }

    this.setState({ itemsData });
    this.onUpdateItemsData(itemsData);
  };

  handleDeleteFormaPagamento = (idPagamento, codigoEntrega) => {
    let { itemsData } = this.state;
    let item = itemsData.find((_item) => _item.CODIGO === codigoEntrega);
    if (item.pagamentos === undefined) {
      item.valorAcertado = 0;
      item.pagamentos = [];
    } else {
      let pagamentos = item.pagamentos.filter((pg) => {
        return pg.id !== idPagamento;
      });
      item.pagamentos = [...pagamentos];
      let _valorAcertado = 0;
      for (const pgto of item.pagamentos) {
        _valorAcertado += pgto.valor;
      }
      item.valorAcertado = _valorAcertado;
    }
    this.setState({ itemsData });
    this.onUpdateItemsData(itemsData);
  };

  setStartLogistics = async () => {
    try {
      const { empresaAtiva, frotaId, driverData } = this.state;
      const url = '/v1/logistics/start/' + empresaAtiva + '/' + frotaId;
      const retorno = await api.post(url);
      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          driverData.REN_FLG_STATUS = 1;
          await setLocalObject('driverData', driverData);
          //console.log(driverData);
          this.setState({ driverData });
        } else {
          this.setState({ driverData: [] });
        }
      }
    } catch (err) {
      alerta('Erro ao iniciar a entrega =>' + err);
      return [];
    }
  };

  onChangeFiltroSituacaoEntrega = (status) => {
    //console.log(status);
    this.setState({ statusEntrega: status });
  };

  onChangeFiltroExtrato = (e) => {
    //console.log(e.target.value);
    let { filtroExtrato } = this.state;
    filtroExtrato = e.target.value;
    this.setState({ filtroExtrato });
  };

  doAbrirDetalhes = () => {
    //console.log('doAbrirDetalhes1');
    this.handleSaveState(this.state);
    this.props.history.push('/logistics/moredetails/');
  };

  abrirDetalhes = (e, item) => {
    // this.state.itemSelecionado = item;
    // e.persist();
    this.setState({ itemSelecionado: item }, () =>
      setTimeout(this.doAbrirDetalhes(), 10)
    );
    // this.setState({itemSelecionado: item}, this.doAbrirDetalhes());
    // setTimeout(this.doAbrirDetalhes(), 1000);

    // this.handleSaveState(this.state);
    // this.props.history.push('/logistics/moredetails/');

    // let {itemSelecionado} = this.state;
    // itemSelecionado = item;
    // this.setState({ itemSelecionado});
    // setInterval(this.doAbrirDetalhes(), 100);
    // this.startTimer(this.doAbrirDetalhes(), 100);
  };
  render() {
    const {
      filtroExtrato,
      driverData,
      alertLocalStarted,
      itemsData,
      totalEntregas,
      totalEntregues,
      totalPendentes,
      statusEntrega,
    } = this.state;
    return (
      <Container>
        <Titulo>
          <p>Entregas</p>
        </Titulo>
        {driverData !== undefined && driverData.COD_MOTORISTA !== undefined ? (
          <>
            {!alertLocalStarted ? (
              <>
                <Linha className="linhaFiltroEntregas">
                  <Collapsible
                    className="filtroEntregas"
                    accordion={false}
                    options={{
                      inDuration: '0',
                      outDuration: '0',
                    }}
                    style={{
                      width: '100%',
                      borderStyle: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    <CollapsibleItem
                      onSelect={null}
                      expanded={false}
                      header={<></>}
                      icon={
                        <>
                          <Icon>filter_list</Icon>
                        </>
                      }
                      node="div"
                    >
                      <DivDetalhe>
                        <SaibRadioGroup
                          valueItems={'"","1","0"'}
                          classNameItems={
                            '"itemTodos","itemRealizadas","itemNaoEntregues"'
                          }
                          textItems={'"Todos","Realizadas","Faltam"'}
                          idItems={
                            '"itemTodos","itemRealizadas","itemNaoEntregues"'
                          }
                          classNameRadio="FiltroSituacaoEntrega"
                          flexDirectionRadio="row"
                          disabledRadio="false"
                          captionRadio=""
                          defaultCheckedId={'itemNaoEntregues'}
                          onChange={this.onChangeFiltroSituacaoEntrega}
                        />
                      </DivDetalhe>
                    </CollapsibleItem>
                  </Collapsible>
                </Linha>
                <Linha style={{ marginTop: '-50px' }}>
                  <DivDetalhe style={{ minWidth: 'calc(50% - 2px)' }}>
                    <Labels>Motorista</Labels>
                    <p>
                      {driverData.COD_MOTORISTA +
                        ' - ' +
                        driverData.DESC_MOTORISTA.toLowerCase()}
                    </p>
                  </DivDetalhe>
                  <DivDetalhe
                    className="right"
                    style={{ minWidth: 'calc(50% - 2px)' }}
                  >
                    <Labels>Placa</Labels>
                    <p>{driverData.PLACA_FROTA}</p>
                  </DivDetalhe>
                </Linha>
                <Linha className="mobileCenter" style={{ marginTop: '20px' }}>
                  <NumeroEntregas qtde={totalEntregas} type="0" />
                  <NumeroEntregas qtde={totalEntregues} type="1" />
                  <NumeroEntregas qtde={totalPendentes} type="2" />
                </Linha>
                <Linha className="mobileCenter" style={{ marginTop: '10px' }}>
                  <DivDetalhe
                    style={{
                      paddingLeft: '0px',
                      paddingRight: '5px',
                    }}
                  >
                    <button
                      disabled={driverData.REN_FLG_STATUS !== 0}
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={this.setStartLogistics}
                    >
                      Abertura
                    </button>
                  </DivDetalhe>
                  {itemsData !== undefined && (
                    <DivDetalhe
                      style={{
                        paddingLeft: '0px',
                        paddingRight: '5px',
                      }}
                    >
                      <Dialog
                        iconeBotaoPadrao={<></>}
                        classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-primary-local"
                        textoBotaoPadrao="Fech.rota"
                        titulo=""
                        tituloBotaoSim={
                          <>
                            <Icon>check</Icon>Fechar
                          </>
                        }
                        classeBotaoSim={'waves-effect waves-light saib-button is-primary modal-close'}
                        tituloBotaoNao={
                          <>
                            <Icon>arrow_back</Icon>Voltar
                          </>
                        }
                        classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                        message={<FecharRota data={itemsData} />}
                        onNo={() => {}}
                        onYes={() => {}}
                      />
                    </DivDetalhe>
                  )}
                  <DivDetalhe
                    style={{
                      paddingLeft: '0px',
                      paddingRight: '0px',
                    }}
                  >
                    <button
                      disabled={driverData.REN_FLG_STATUS === 0}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      Próx.clientes
                    </button>
                  </DivDetalhe>
                </Linha>
                <Linha
                  style={{
                    color: '#bf1f7c',
                    marginTop: '20px',
                    padding: '5px 10px 0px 10px',
                    fontWeight: '700',
                  }}
                >
                  <i style={{ marginRight: '10px' }} className="material-icons">
                    category
                  </i>
                  Pedidos
                </Linha>
                <Linha
                  style={{
                    paddingLeft: '20px',
                    fontWeight: '700',
                    paddingBottom: '5px',
                    paddingTop: '5px',
                  }}
                >
                  <DivDetalhe style={{ paddingBottom: '0px' }}>Seq.</DivDetalhe>
                  <DivDetalhe style={{ paddingBottom: '0px' }}>
                    Entr.
                  </DivDetalhe>
                  <DivDetalhe style={{ paddingBottom: '0px' }}>
                    Cliente
                  </DivDetalhe>
                </Linha>
                <Linha style={{ padding: '0px', flexDirection: 'column' }}>
                  {itemsData !== undefined &&
                    itemsData.map((item) => (
                      <Collapsible
                        key={item.CLI_ID}
                        accordion={false}
                        options={{
                          inDuration: '0',
                          outDuration: '0',
                        }}
                        className="entregas"
                        style={{
                          padding: '10px 0px 10px 0px',
                          width: '100%',
                          borderStyle: 'none',
                          boxShadow: 'none',
                          display:
                            statusEntrega === ''
                              ? 'flex'
                              : statusEntrega === '1' && item.ENTREGUE === 1
                              ? 'flex'
                              : statusEntrega === '0' &&
                                (item.ENTREGUE === 0 || item.ENTREGUE == null)
                              ? 'flex'
                              : 'none',
                        }}
                      >
                        <CollapsibleItem
                          onSelect={null}
                          key={parseInt(item.CODIGO)}
                          expanded={false}
                          header={
                            <>
                              <DivDetalheItems>
                                {item.SEQUENCIA}
                              </DivDetalheItems>
                              <DivDetalheItems>
                                {item.CODIGO_ENTREGA}
                              </DivDetalheItems>
                              <DivDetalheItems>{item.FANTASIA}</DivDetalheItems>
                            </>
                          }
                          icon={
                            <>
                              <li className="material-icons plus">
                                add_circle_outline
                              </li>
                              <li className="material-icons minus">
                                remove_circle_outline
                              </li>
                            </>
                          }
                          node="div"
                        >
                          <Linha style={{ flexWrap: 'wrap' }}>
                            <DivDetalhe>
                              <img
                                src={
                                  item.statusEntrega !== undefined &&
                                  item.statusEntrega === 3
                                    ? truckChecked
                                    : truckExclamation
                                }
                                alt="Entregue"
                                width={'32px'}
                              />
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Razão social
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.DESCRICAO}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Fantasia
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.FANTASIA}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Endereço
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.ENDERECO}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Bairro
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.BAIRRO}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Cidade
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.CIDADE + '/' + item.UF}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Telefone
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.TELEFONE}
                              </Labels>
                            </DivDetalhe>
                          </Linha>
                          <Linha className="mobileCenter">
                            <DivDetalhe>
                              <Labels fontSize={'0.9rem'} fontWeight={'700'}>
                                Qtde: {item.items[0].QUANTIDADE}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.9rem'} fontWeight={'700'}>
                                Valor: {currencyFormat(item.items[0].VALOR, '')}
                              </Labels>
                            </DivDetalhe>
                          </Linha>
                          <Linha>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'900'}>
                                Complemento/Observação
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.INSTRUCOES !== 'null'
                                  ? item.INSTRUCOES
                                  : ' ' + item.COMPLEMENTO !== 'null'
                                  ? item.COMPLEMENTO
                                  : ''}
                              </Labels>
                            </DivDetalhe>
                            <DivDetalhe>
                              <Labels fontSize={'0.7rem'} fontWeight={'700'}>
                                Contato
                              </Labels>
                              <Labels fontSize={'0.9rem'} fontWeight={'400'}>
                                {item.CONTATO}
                              </Labels>
                            </DivDetalhe>
                          </Linha>
                          <Linha
                            className="mobileCenter"
                            style={{
                              margin: '20px 0px 10px 0px',
                              padding: '0px',
                            }}
                          >
                            <DivDetalhe style={{ padding: '0px 5px 0px 5px' }}>
                              <button
                                className="waves-effect waves-light saib-button is-primary"
                                onClick={(e) => {
                                  this.abrirDetalhes(e, item);
                                }}
                              >
                                + Detalhe
                              </button>
                            </DivDetalhe>
                            {/* <DivDetalhe style={{ padding: '0px 5px 0px 5px' }}>
                              <Dialog
                                iconeBotaoPadrao={<></>}
                                classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-primary-local"
                                textoBotaoPadrao="+ Detalhes"
                                titulo=""
                                tituloBotaoSim={
                                  <>
                                    <Icon>arrow_back</Icon>Voltar
                                  </>
                                }
                                classeBotaoSim={
                                  'waves-effect waves-light saib-button is-primary modal-close'
                                }
                                tituloBotaoNao="Não"
                                classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close hidden"
                                message={
                                  <LogisticsMaisDetalhes
                                    data={item}
                                    //   onUpdateSale={this.onUpdateSale}
                                  />
                                }
                                onNo={() => {}}
                                onYes={() => {}}
                              />
                            </DivDetalhe> */}
                            <DivDetalhe style={{ padding: '0px 5px 0px 5px' }}>
                              <button className="waves-effect waves-light saib-button is-primary">
                                Mapa
                              </button>
                            </DivDetalhe>
                            {item.extrato !== undefined &&
                              item.extrato.length > 0 && (
                                <>
                                  <Dialog
                                    iconeBotaoPadrao={<></>}
                                    classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-primary-local"
                                    textoBotaoPadrao="Cta.corrente"
                                    titulo=""
                                    tituloBotaoSim={
                                      <>
                                        <Icon>arrow_back</Icon>Voltar
                                      </>
                                    }
                                    classeBotaoSim={
                                      'waves-effect waves-light saib-button is-primary modal-close'
                                    }
                                    tituloBotaoNao="Não"
                                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close hidden"
                                    message={
                                      <ContaCorrenteRetornavel
                                        data={item.extrato}
                                        filtroExtrato={filtroExtrato}
                                        onChangeFiltroExtrato={
                                          this.onChangeFiltroExtrato
                                        }
                                      />
                                    }
                                    onNo={() => {}}
                                    onYes={() => {}}
                                  />
                                </>
                              )}
                            <DivDetalhe
                              className={
                                item.extrato !== undefined &&
                                item.extrato.length > 0 &&
                                'ultimoBotaoAtendimento'
                              }
                              style={{ padding: '0px 5px 0px 5px' }}
                            >
                              <Dialog
                                iconeBotaoPadrao={<></>}
                                classeBotaoPadrao="waves-effect waves-light saib-button is-call-to-action is-call-to-action-local"
                                textoBotaoPadrao={
                                  item.ENTREGUE == null ? 'Atender' : 'Atendido'
                                }
                                titulo=""
                                tituloBotaoSim={
                                  <>
                                    <Icon>arrow_back</Icon>Voltar
                                  </>
                                }
                                classeBotaoSim={
                                  'waves-effect waves-light saib-button is-primary modal-close modalCliente_' +
                                  item.CLI_ID
                                }
                                tituloBotaoNao="Não"
                                classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close hidden"
                                message={
                                  <Atender
                                    data={item}
                                    onUpdateItem={this.onUpdateItem}
                                    onUpdateItemProduto={
                                      this.onUpdateItemProduto
                                    }
                                    onUpdateItemProdutoRetorno={
                                      this.onUpdateItemProdutoRetorno
                                    }
                                    handleAppFormaPagamento={
                                      this.handleAppFormaPagamento
                                    }
                                    handleDeleteFormaPagamento={
                                      this.handleDeleteFormaPagamento
                                    }
                                    onFinalizarEntrega={this.onFinalizarEntrega}
                                  />
                                }
                                onNo={() => {}}
                                onYes={() => {}}
                              />
                            </DivDetalhe>
                          </Linha>
                        </CollapsibleItem>
                      </Collapsible>
                    ))}
                </Linha>
              </>
            ) : (
              <OutraRotaIniciada frotaId={driverData.FRT_ID} />
            )}
          </>
        ) : (
          <SemEntregas />
        )}
      </Container>
    );
  }
}

export default connect((state) => ({ reducer: state.logistics }))(
  LogisticsHome
);
