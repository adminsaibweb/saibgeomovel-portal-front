import React, { Component } from 'react';
import { Container, Line, IndicatorsLine, DivDetalhe, Linha, Labels } from './style';
import Skeleton from 'react-loading-skeleton';
import { alerta, formatFloatBr, currencyFormat } from '../../../services/funcoes';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import ReactToPrint from 'react-to-print';
import ReportHeader from '../../System/ReportHeader';
import { utils, writeFile } from 'xlsx';

export class SalesAndTeamGoalsData extends Component {
  state = {
    data: undefined,
    changedFilter: 0,
    loading: 1,
    filter: []
  };

  componentDidMount = () => {
    // this.handleAllDataUpdate();
  };

  handleCreateExcelFile = async () => {
    const { data } = this.state

    if (this.props.data.totalClientes > 0) {
      let layoutFile = await Promise.all(
        data.map(element => {
          let item = {}
          if (element.vendaValor !== 0) {
            item = {
              "Produto": element.codigo + ' - ' + element.descricao.toLowerCase(),
              "Marca": element.marca,
              "Unidade": element.unidade,
              "Preço médio": element.precoMedio,
              "Venda valor": currencyFormat(element.vendaValor),
              "Meta valor": currencyFormat(element.metaValor),
              "Dif. valor": currencyFormat(element.diferencaValor),
              "Venda qtde.": element.vendaQuantidade,
              "Meta qtde.": element.metaQuantidade,
              "Dif qtde.": element.diferencaQtde,
            }
          }

          return item
        })
      )
      layoutFile = layoutFile.filter(item => item.Produto);

      const layoutSummary = {
        "Produto": `Total de clientes: ${this.props.data.totalClientes}`,
        "Marca": `Fora de rota: ${this.props.data.foraRota}`,
        "Unidade": `% positivação: ${this.props.data.percentPositivados}`,
        "Preço médio": `% negativação: ${this.props.data.percentMotivados}`,
        "Venda valor": `Nr. clientes posit.: ${this.props.data.clientesPositivados}`,
        "Meta valor": `Nr. clientes negat.: ${this.props.data.clientesMotivados}`,
        "Dif. valor": `Total volume: ${this.props.data.totalVolume}`,
        "Venda qtde.": `Total peso: ${this.props.data.totalPeso}`,
        "Meta qtde.": `Valor total geral: ${currencyFormat(this.props.data.totalValor)}`,
        "Dif qtde.": `Valor total venda: ${currencyFormat(this.props.data.totalVenda)}, Valor total á prazo: ${currencyFormat(this.props.data.totalAprazo)}, Valor total á vista: ${currencyFormat(this.props.data.totalAvista)}`,
      }
      layoutFile.push(layoutSummary)
      let wb = utils.book_new(),
      ws = utils.json_to_sheet(layoutFile)

      utils.book_append_sheet(wb, ws, "relatório")
      writeFile(wb, "relatório.xlsx")
    } else {
      alerta("Não há dados para baixar", 1)
    }
  }

  handleAllDataUpdate = async () => {
    let { filter, data, changedFilter, totalizador } = this.state;

    if (this.props.data === undefined) {
      return;
    }

    totalizador = parseInt(this.props.totalizador);
    if (totalizador === 0) {
      data = this.props.data.products;
      let counter = 0;
      for (const dataItem of data) {
        if (
          dataItem.vendaQuantidade !== 0 ||
          dataItem.vendaValor !== 0 ||
          dataItem.metaValor !== 0 ||
          dataItem.metaQuantidade !== 0
        ) {
          dataItem.counter = counter;
          counter += 1;
        }
      }
    }
    if (totalizador === 1) {
      data = this.props.data.supervisors;
      let counter = 0;
      for (const sup of data) {
        for (const route of sup.routes) {
          for (const dataItem of route.products) {
            if (
              dataItem.vendaQuantidade !== 0 ||
              dataItem.vendaValor !== 0 ||
              dataItem.metaValor !== 0 ||
              dataItem.metaQuantidade !== 0
            ) {
              dataItem.counter = counter;
              counter += 1;
            }
          }
        }
      }
    }
    if (totalizador === 2) {
      data = this.props.data.routes;
      let counter = 0;
      for (const sup of data) {
        for (const dataItem of sup.products) {
          if (
            dataItem.vendaQuantidade !== 0 ||
            dataItem.vendaValor !== 0 ||
            dataItem.metaValor !== 0 ||
            dataItem.metaQuantidade !== 0
          ) {
            dataItem.counter = counter;
            counter += 1;
          }
        }
      }
    }
    if (totalizador === 3) {
      data = this.props.data.customers;
      let counter = 0;
      for (const sup of data) {
        for (const dataItem of sup.products) {
          if (
            dataItem.vendaQuantidade !== 0 ||
            dataItem.vendaValor !== 0 ||
            dataItem.metaValor !== 0 ||
            dataItem.metaQuantidade !== 0
          ) {
            dataItem.counter = counter;
            counter += 1;
          }
        }
      }
    }

    changedFilter += 1;

    filter = [];
    let filterItem = {};
    filterItem = {};
    filterItem.objectName = 'Supervisores';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.supervisoresSelecionados);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Totalizador';
    filterItem.objectValue =
      totalizador === 0 ? 'Geral' : totalizador === 1 ? 'Supervisor' : totalizador === 2 ? 'Vendedor' : 'Cliente';
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Vendedores';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.vendedoresSelecionados);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Canais';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.canaisSelecionados);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Produtos';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.produtosSelecionados);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Marcas';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.marcasSelecionadas);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Sabores';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.saboresSelecionados);
    filter.push(filterItem);

    filterItem = {};
    filterItem.objectName = 'Embalagens';
    filterItem.objectValue = this.prepareFilterItemValue(this.props.embalagensSelecionadas);
    filter.push(filterItem);

    data = data.sort(function (a, b) {
      if (a.marca > b.marca) {
        return 1;
      }
      if (a.marca < b.marca) {
        return -1;
      }
      return 0;
    });

    this.setState({ data, changedFilter, loading: 0, totalizador, filter });
  };

  prepareFilterItemValue = (item) => {
    let result = undefined;
    if (Array.isArray(item)) {
      result = '';
      for (const _item of item) {
        result += _item.tag + ', ';
      }
      if (result === '') {
        result = undefined;
      } else {
        result = result.substr(0, result.length - 2);
      }
    } else {
      result = item;
    }
    return result;
  };

  componentDidUpdate = () => {
    let { changedFilter } = this.state;
    if (this.props.data.clientesPositivados !== undefined && this.props.changedFilter !== changedFilter) {
      this.setState({ loading: 1, data: undefined });
      this.handleAllDataUpdate();
    }
  };

  getHeader = (data) => {
    return data.codigo + ' - ' + data.descricao + ' - ' + data.unidade;
  };

  render() {
    const { data, loading, totalizador, filter } = this.state;
    return (
      <Container>
        {this.props.loading === 1 || loading === 1 ? (
          <>
            <div style={{ width: '100%' }}>
              <Skeleton height={30} />
            </div>
            <div style={{ width: '100%' }}>
              <Skeleton count={1} height={20} />
            </div>
            <div style={{ width: '100%', height: '20px' }}></div>
            <div style={{ width: '100%' }}>
              <Skeleton count={10} />
            </div>
          </>
        ) : (
          <>
            {document.getElementsByTagName('body')[0].clientWidth < 768 ? (
              <>
                {data !== undefined && (
                  <Linha style={{ padding: '0px 20px 10px 20px' }}>
                    <h6 style={{ fontWeight: '900' }}>Resumo Vendas</h6>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Total clientes:
                      </Labels>
                      <Labels>{this.props.data.totalClientes}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Fora de rota:
                      </Labels>
                      <Labels>{this.props.data.foraRota}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        % positivação:
                      </Labels>
                      <Labels>{this.props.data.percentPositivados}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        % negativação:
                      </Labels>
                      <Labels>{this.props.data.percentMotivados}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Nr. clientes posit.:
                      </Labels>
                      <Labels>{this.props.data.clientesPositivados}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Nr. clientes negat.:
                      </Labels>
                      <Labels>{this.props.data.clientesMotivados}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Total volume:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalVolume, '')}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Total peso:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalPeso, '')}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Valor total geral:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalValor)}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Valor total venda:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalVenda)}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Valor total á prazo:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalAprazo)}</Labels>
                    </Linha>
                    <Linha style={{ alignItems: 'center', width: '100%' }}>
                      <Labels fontWeight={700} fontSize={0.8} style={{ paddingRight: '10px', minWidth: '130px' }}>
                        Valor total á vista:
                      </Labels>
                      <Labels>{formatFloatBr(this.props.data.totalAvista)}</Labels>
                    </Linha>
                  </Linha>
                )}
                {totalizador === 0 &&
                  data.map((dataItem) => (
                    <>
                      <Line style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {(dataItem.vendaQuantidade !== 0 ||
                          dataItem.vendaValor !== 0 ||
                          dataItem.metaValor !== 0 ||
                          dataItem.metaQuantidade !== 0) && (
                            <>
                              <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                                <Collapsible
                                  className="indicadorRotas"
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
                                    key={dataItem.prodId}
                                    expanded={true}
                                    header={this.getHeader(dataItem)}
                                    node="div"
                                  >
                                    <Linha style={{ justifyContent: 'space-around' }}>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          margin: '3px',
                                          width: '96%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={'1.2rem'}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Vlr. venda
                                          </Labels>
                                          <Labels
                                            fontWeight={700}
                                            fontSize={'1.2rem'}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {formatFloatBr(dataItem.vendaValor)}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Pr. méd.
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {formatFloatBr(dataItem.precoMedio)}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Dif. qtde
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {dataItem.diferencaQtde}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Dif. vlr
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {formatFloatBr(dataItem.diferencaValor)}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Meta qtde
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {dataItem.metaQuantidade}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Meta vlr
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {formatFloatBr(dataItem.metaValor)}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                          width: '100%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Und.
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            {dataItem.unidade}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                      <DivDetalhe
                                        style={{
                                          padding: '2px',
                                          border: '1px solid #ccc',
                                          borderRadius: '10px',
                                          margin: '3px',
                                          width: '30%',
                                        }}
                                      >
                                        <Linha
                                          style={{
                                            cursor: 'pointer',
                                            justifyContent: 'space-between',
                                          }}
                                        >
                                          <Labels
                                            fontWeight={700}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                            }}
                                          >
                                            Qtde venda
                                          </Labels>
                                          <Labels
                                            fontWeight={500}
                                            fontSize={0.8}
                                            style={{
                                              cursor: 'pointer',
                                              paddingRight: '2px',
                                              textTransform: 'capitalize',
                                            }}
                                          >
                                            {dataItem.vendaQuantidade}
                                          </Labels>
                                        </Linha>
                                      </DivDetalhe>
                                    </Linha>
                                  </CollapsibleItem>
                                </Collapsible>
                              </DivDetalhe>
                            </>
                          )}
                      </Line>
                    </>
                  ))}

                {totalizador === 1 && (
                  <>
                    <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                      {data.map((sup) => (
                        <Collapsible
                          className="indicadorSupervisor"
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
                            // key={dataItem.prodId}
                            expanded={true}
                            header={'Supervisor: ' + sup.name + ' - ' + formatFloatBr(sup.total, '')}
                            node="div"
                          >
                            {sup.routes.map((route) => (
                              <Collapsible
                                className="indicadorRoutes"
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
                                  // key={dataItem.prodId}
                                  expanded={true}
                                  header={'Vendedor: ' + route.name + ' - ' + formatFloatBr(route.total, '')}
                                  node="div"
                                >
                                  {route.products.map((dataItem) => (
                                    <>
                                      <Line
                                        style={{
                                          flexDirection: 'row',
                                          flexWrap: 'wrap',
                                        }}
                                      >
                                        {(dataItem.vendaQuantidade !== 0 ||
                                          dataItem.vendaValor !== 0 ||
                                          dataItem.metaValor !== 0 ||
                                          dataItem.metaQuantidade !== 0) && (
                                            <>
                                              <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                                                <Collapsible
                                                  className="indicadorRotas"
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
                                                    key={dataItem.prodId}
                                                    expanded={true}
                                                    header={this.getHeader(dataItem)}
                                                    node="div"
                                                  >
                                                    <Linha
                                                      style={{
                                                        justifyContent: 'space-around',
                                                      }}
                                                    >
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          margin: '3px',
                                                          width: '96%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'center',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={'1.2rem'}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Vlr. venda
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={'1.2rem'}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {formatFloatBr(dataItem.vendaValor)}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Pr. méd.
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {formatFloatBr(dataItem.precoMedio)}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Dif. qtde
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {dataItem.diferencaQtde}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Dif. vlr
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {formatFloatBr(dataItem.diferencaValor)}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Meta qtde
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {dataItem.metaQuantidade}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Meta vlr
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {formatFloatBr(dataItem.metaValor)}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                                          width: '100%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Und.
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            {dataItem.unidade}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                      <DivDetalhe
                                                        style={{
                                                          padding: '2px',
                                                          border: '1px solid #ccc',
                                                          borderRadius: '10px',
                                                          margin: '3px',
                                                          width: '30%',
                                                        }}
                                                      >
                                                        <Linha
                                                          style={{
                                                            cursor: 'pointer',
                                                            justifyContent: 'space-between',
                                                          }}
                                                        >
                                                          <Labels
                                                            fontWeight={700}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                            }}
                                                          >
                                                            Qtde venda
                                                          </Labels>
                                                          <Labels
                                                            fontWeight={500}
                                                            fontSize={0.8}
                                                            style={{
                                                              cursor: 'pointer',
                                                              paddingRight: '2px',
                                                              textTransform: 'capitalize',
                                                            }}
                                                          >
                                                            {dataItem.vendaQuantidade}
                                                          </Labels>
                                                        </Linha>
                                                      </DivDetalhe>
                                                    </Linha>
                                                  </CollapsibleItem>
                                                </Collapsible>
                                              </DivDetalhe>
                                            </>
                                          )}
                                      </Line>
                                    </>
                                  ))}
                                </CollapsibleItem>
                              </Collapsible>
                            ))}
                          </CollapsibleItem>
                        </Collapsible>
                      ))}
                    </DivDetalhe>
                  </>
                )}

                {totalizador === 2 && (
                  <>
                    <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                      {data.map((route) => (
                        <Collapsible
                          className="indicadorRoutes"
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
                            // key={dataItem.prodId}
                            expanded={true}
                            header={'Vendedor: ' + route.name + ' - ' + formatFloatBr(route.total, '')}
                            node="div"
                          >
                            {route.products.map((dataItem) => (
                              <>
                                <Line
                                  style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {(dataItem.vendaQuantidade !== 0 ||
                                    dataItem.vendaValor !== 0 ||
                                    dataItem.metaValor !== 0 ||
                                    dataItem.metaQuantidade !== 0) && (
                                      <>
                                        <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                                          <Collapsible
                                            className="indicadorRotas"
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
                                              key={dataItem.prodId}
                                              expanded={true}
                                              header={this.getHeader(dataItem)}
                                              node="div"
                                            >
                                              <Linha
                                                style={{
                                                  justifyContent: 'space-around',
                                                }}
                                              >
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    margin: '3px',
                                                    width: '96%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'center',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={'1.2rem'}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Vlr. venda
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={'1.2rem'}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.vendaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Pr. méd.
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.precoMedio)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Dif. qtde
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.diferencaQtde}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Dif. vlr
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.diferencaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Meta qtde
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.metaQuantidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Meta vlr
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.metaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                                    width: '100%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Und.
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.unidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Qtde venda
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                        textTransform: 'capitalize',
                                                      }}
                                                    >
                                                      {dataItem.vendaQuantidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                              </Linha>
                                            </CollapsibleItem>
                                          </Collapsible>
                                        </DivDetalhe>
                                      </>
                                    )}
                                </Line>
                              </>
                            ))}
                          </CollapsibleItem>
                        </Collapsible>
                      ))}
                    </DivDetalhe>
                  </>
                )}

                {totalizador === 3 && (
                  <>
                    <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                      {data.map((customer) => (
                        <Collapsible
                          className="indicadorRoutes"
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
                            // key={dataItem.prodId}
                            expanded={true}
                            header={'Cliente: ' + customer.name + ' - Rota: ' + customer.route + ' - ' + formatFloatBr(customer.total, '')}
                            node="div"
                          >
                            {customer.products.map((dataItem) => (
                              <>
                                <Line
                                  style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {(dataItem.vendaQuantidade !== 0 ||
                                    dataItem.vendaValor !== 0 ||
                                    dataItem.metaValor !== 0 ||
                                    dataItem.metaQuantidade !== 0) && (
                                      <>
                                        <DivDetalhe className="divDetalhe" style={{ width: '100%' }}>
                                          <Collapsible
                                            className="indicadorRotas"
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
                                              key={dataItem.prodId}
                                              expanded={true}
                                              header={this.getHeader(dataItem)}
                                              node="div"
                                            >
                                              <Linha
                                                style={{
                                                  justifyContent: 'space-around',
                                                }}
                                              >
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    margin: '3px',
                                                    width: '96%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'center',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={'1.2rem'}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Vlr. venda
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={'1.2rem'}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.vendaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Pr. méd.
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.precoMedio)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Dif. qtde
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.diferencaQtde}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Dif. vlr
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.diferencaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Meta qtde
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.metaQuantidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Meta vlr
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {formatFloatBr(dataItem.metaValor)}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                                    width: '100%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Und.
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      {dataItem.unidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                                <DivDetalhe
                                                  style={{
                                                    padding: '2px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '10px',
                                                    margin: '3px',
                                                    width: '30%',
                                                  }}
                                                >
                                                  <Linha
                                                    style={{
                                                      cursor: 'pointer',
                                                      justifyContent: 'space-between',
                                                    }}
                                                  >
                                                    <Labels
                                                      fontWeight={700}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                      }}
                                                    >
                                                      Qtde venda
                                                    </Labels>
                                                    <Labels
                                                      fontWeight={500}
                                                      fontSize={0.8}
                                                      style={{
                                                        cursor: 'pointer',
                                                        paddingRight: '2px',
                                                        textTransform: 'capitalize',
                                                      }}
                                                    >
                                                      {dataItem.vendaQuantidade}
                                                    </Labels>
                                                  </Linha>
                                                </DivDetalhe>
                                              </Linha>
                                            </CollapsibleItem>
                                          </Collapsible>
                                        </DivDetalhe>
                                      </>
                                    )}
                                </Line>
                              </>
                            ))}
                          </CollapsibleItem>
                        </Collapsible>
                      ))}
                    </DivDetalhe>
                  </>
                )}
              </>
            ) : (
              <>
                {totalizador === 0 && (
                  <>
                    <Linha>
                      <ReactToPrint
                        documentTitle={'Rel. Histórico Saldo de Desconto Flexível'}
                        onBeforeGetContent={() => {
                          this.setState({ imprimindo: true });
                        }}
                        onAfterPrint={() => {
                          this.setState({ imprimindo: false });
                        }}
                        trigger={() => {
                          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                          // to the root node of the returned component as it will be overwritten.
                          return (
                            <Line print>
                              <button title='Imprimir' className="waves-effect waves-light saib-button is-primary">
                                <Icon>print</Icon>
                              </button>
                            </Line>
                          );
                        }}
                        content={() => this.componentRef}
                      />
                      <button onClick={this.handleCreateExcelFile} style={{ marginLeft: "5px" }} title='Baixar arquivo excel' className="waves-effect waves-light saib-button is-primary">
                        <Icon>file_download</Icon>
                      </button>

                    </Linha>
                    <IndicatorsLine ref={(el) => (this.componentRef = el)} style={{ marginBottom: '30px' }}>
                      <Linha style={{ width: '100%' }}>
                        <ReportHeader title={'Rel. Vendas e Metas Equipes'} filter={filter} />
                      </Linha>
                      <table
                        style={{
                          fontSize: '0.8rem',
                          color: '#858585',
                        }}
                      >
                        <thead
                          style={{
                            fontWeight: '700',
                            width: '100%',
                            top: '-10px',
                            position: 'sticky',
                            backgroundColor: 'white',
                            padding: '10px 0px',
                          }}
                        >
                          <td id="product">Produto</td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Marca
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Un
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Prc. médio
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Vda. valor
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Meta valor
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Dif.
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Vda. qtde
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Meta qtde
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Dif.
                          </td>
                        </thead>
                        {data !== undefined &&
                          data.length > 0 &&
                          data.map((dataItem) => (
                            <>
                              {(dataItem.vendaQuantidade !== 0 ||
                                dataItem.vendaValor !== 0 ||
                                dataItem.metaValor !== 0 ||
                                dataItem.metaQuantidade !== 0) && (
                                  <>
                                    <tr
                                      key={dataItem.prodId}
                                      style={{
                                        backgroundColor: dataItem.counter % 2 !== 0 ? 'rgb(223, 178, 251)' : 'white',
                                      }}
                                    >
                                      <td
                                        id="product"
                                        style={{
                                          textTransform: 'capitalize',
                                          fontWeight: '700',
                                        }}
                                      >
                                        {dataItem.codigo + ' - ' + dataItem.descricao.toLowerCase()}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.marca}
                                      </td>{' '}
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.unidade}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.precoMedio}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {formatFloatBr(dataItem.vendaValor)}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {formatFloatBr(dataItem.metaValor)}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {formatFloatBr(dataItem.diferencaValor)}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.vendaQuantidade}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.metaQuantidade}
                                      </td>
                                      <td
                                        id="indicator"
                                        style={{
                                          fontWeight: '500',
                                        }}
                                      >
                                        {dataItem.diferencaQtde}
                                      </td>
                                    </tr>
                                  </>
                                )}
                            </>
                          ))}
                      </table>

                      {data !== undefined && (
                        <Linha style={{ padding: '0px 20px 10px 20px' }}>
                          <h6 style={{ fontWeight: '900' }}>Resumo Vendas</h6>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total clientes:
                            </Labels>
                            <Labels>{this.props.data.totalClientes}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Fora de rota:
                            </Labels>
                            <Labels>{this.props.data.foraRota}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % positivação:
                            </Labels>
                            <Labels>{this.props.data.percentPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % negativação:
                            </Labels>
                            <Labels>{this.props.data.percentMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes posit.:
                            </Labels>
                            <Labels>{this.props.data.clientesPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes negat.:
                            </Labels>
                            <Labels>{this.props.data.clientesMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total volume:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVolume, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total peso:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalPeso, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total geral:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalValor)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total venda:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVenda)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á prazo:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAprazo)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á vista:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAvista)}</Labels>
                          </Linha>
                        </Linha>
                      )}
                    </IndicatorsLine>
                  </>
                )}
                {totalizador === 1 && (
                  <>
                    <Linha>
                      <ReactToPrint
                        documentTitle={'Rel. Histórico Saldo de Desconto Flexível'}
                        onBeforeGetContent={() => {
                          this.setState({ imprimindo: true });
                        }}
                        onAfterPrint={() => {
                          this.setState({ imprimindo: false });
                        }}
                        trigger={() => {
                          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                          // to the root node of the returned component as it will be overwritten.
                          return (
                            <Line>
                              <button className="waves-effect waves-light saib-button is-primary">
                                <Icon>print</Icon>
                              </button>
                            </Line>
                          );
                        }}
                        content={() => this.componentRef}
                      />
                    </Linha>
                    <IndicatorsLine ref={(el) => (this.componentRef = el)} style={{ marginBottom: '30px' }}>
                      <Linha style={{ width: '100%' }}>
                        <ReportHeader title={'Rel. Vendas e Metas Equipes'} filter={filter} />
                      </Linha>
                      {data.map((sup) => (
                        <>
                          <Linha style={{ width: '100%' }} className="subTituloSupervisor">
                            <DivDetalhe>
                              <h6 className="titulo">Supervisor: {sup.name}</h6>
                            </DivDetalhe>
                            <DivDetalhe>
                              <h6 className="titulo">Total: {formatFloatBr(sup.total)}</h6>
                            </DivDetalhe>
                          </Linha>
                          {sup.routes.map((route) => (
                            <>
                              <Linha style={{ width: '100%' }} className="subTituloRotas0">
                                <DivDetalhe>
                                  <h6 className="titulo">Rota: {route.name}</h6>
                                </DivDetalhe>
                                <DivDetalhe>
                                  <h6 className="titulo">Total: {formatFloatBr(route.total)}</h6>
                                </DivDetalhe>
                              </Linha>
                              <table
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#858585',
                                }}
                              >
                                <thead
                                  style={{
                                    fontWeight: '700',
                                    width: '100%',
                                    top: '-10px',
                                    position: 'sticky',
                                    backgroundColor: 'white',
                                    padding: '10px 0px',
                                  }}
                                >
                                  <td id="product">Produto</td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Marca
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Un
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Prc. médio
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Vda. valor
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Meta valor
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Dif.
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Vda. qtde
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Meta qtde
                                  </td>
                                  <td
                                    id="indicator"
                                    style={{
                                      paddingRight: '10px !important',
                                    }}
                                  >
                                    Dif.
                                  </td>
                                </thead>
                                {route.products.map((dataItem) => (
                                  <>
                                    {(dataItem.vendaQuantidade !== 0 ||
                                      dataItem.vendaValor !== 0 ||
                                      dataItem.metaValor !== 0 ||
                                      dataItem.metaQuantidade !== 0) && (
                                        <>
                                          <tr
                                            key={dataItem.prodId}
                                            style={{
                                              backgroundColor:
                                                dataItem.counter % 2 !== 0 ? 'rgb(223, 178, 251)' : 'white',
                                            }}
                                          >
                                            <td
                                              id="product"
                                              style={{
                                                textTransform: 'capitalize',
                                                fontWeight: '700',
                                              }}
                                            >
                                              {dataItem.codigo + ' - ' + dataItem.descricao.toLowerCase()}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.marca}
                                            </td>{' '}
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.unidade}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.precoMedio}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {formatFloatBr(dataItem.vendaValor)}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {formatFloatBr(dataItem.metaValor)}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {formatFloatBr(dataItem.diferencaValor)}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.vendaQuantidade}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.metaQuantidade}
                                            </td>
                                            <td
                                              id="indicator"
                                              style={{
                                                fontWeight: '500',
                                              }}
                                            >
                                              {dataItem.diferencaQtde}
                                            </td>
                                          </tr>
                                        </>
                                      )}
                                  </>
                                ))}
                              </table>
                            </>
                          ))}
                        </>
                      ))}
                      {data !== undefined && (
                        <Linha style={{ padding: '30px 20px 10px 20px' }}>
                          <h6 style={{ fontWeight: '900' }}>Resumo Vendas</h6>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total clientes:
                            </Labels>
                            <Labels>{this.props.data.totalClientes}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Fora de rota:
                            </Labels>
                            <Labels>{this.props.data.foraRota}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % positivação:
                            </Labels>
                            <Labels>{this.props.data.percentPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % negativação:
                            </Labels>
                            <Labels>{this.props.data.percentMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes posit.:
                            </Labels>
                            <Labels>{this.props.data.clientesPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes negat.:
                            </Labels>
                            <Labels>{this.props.data.clientesMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total volume:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVolume, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total peso:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalPeso, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total geral:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalValor)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total venda:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVenda)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á prazo:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAprazo)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á vista:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAvista)}</Labels>
                          </Linha>
                        </Linha>
                      )}
                    </IndicatorsLine>
                  </>
                )}
                {totalizador === 2 && (
                  <>
                    <Linha>
                      <ReactToPrint
                        documentTitle={'Rel. Histórico Saldo de Desconto Flexível'}
                        onBeforeGetContent={() => {
                          this.setState({ imprimindo: true });
                        }}
                        onAfterPrint={() => {
                          this.setState({ imprimindo: false });
                        }}
                        trigger={() => {
                          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                          // to the root node of the returned component as it will be overwritten.
                          return (
                            <Line>
                              <button className="waves-effect waves-light saib-button is-primary">
                                <Icon>print</Icon>
                              </button>
                            </Line>
                          );
                        }}
                        content={() => this.componentRef}
                      />
                    </Linha>
                    <IndicatorsLine ref={(el) => (this.componentRef = el)} style={{ marginBottom: '30px' }}>
                      <Linha style={{ width: '100%' }}>
                        <ReportHeader title={'Rel. Vendas e Metas Equipes'} filter={filter} />
                      </Linha>
                      {data.map((route) => (
                        <>
                          <Linha style={{ width: '100%' }} className="subTituloRotas1">
                            <DivDetalhe>
                              <h6 className="titulo">Rota: {route.name}</h6>
                            </DivDetalhe>
                            <DivDetalhe>
                              <h6 className="titulo">Total: {formatFloatBr(route.total)}</h6>
                            </DivDetalhe>
                          </Linha>
                          <table
                            style={{
                              fontSize: '0.8rem',
                              color: '#858585',
                            }}
                          >
                            <thead
                              style={{
                                fontWeight: '700',
                                width: '100%',
                                top: '-10px',
                                position: 'sticky',
                                backgroundColor: 'white',
                                padding: '10px 0px',
                              }}
                            >
                              <td id="product">Produto</td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Marca
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Un
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Prc. médio
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Vda. valor
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Meta valor
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Dif.
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Vda. qtde
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Meta qtde
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Dif.
                              </td>
                            </thead>
                            {route.products.map((dataItem) => (
                              <>
                                {(dataItem.vendaQuantidade !== 0 ||
                                  dataItem.vendaValor !== 0 ||
                                  dataItem.metaValor !== 0 ||
                                  dataItem.metaQuantidade !== 0) && (
                                    <>
                                      <tr
                                        key={dataItem.prodId}
                                        style={{
                                          backgroundColor: dataItem.counter % 2 !== 0 ? 'rgb(223, 178, 251)' : 'white',
                                        }}
                                      >
                                        <td
                                          id="product"
                                          style={{
                                            textTransform: 'capitalize',
                                            fontWeight: '700',
                                          }}
                                        >
                                          {dataItem.codigo + ' - ' + dataItem.descricao.toLowerCase()}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.marca}
                                        </td>{' '}
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.unidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.precoMedio}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.vendaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.metaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.diferencaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.vendaQuantidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.metaQuantidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.diferencaQtde}
                                        </td>
                                      </tr>
                                    </>
                                  )}
                              </>
                            ))}
                          </table>
                        </>
                      ))}
                      {data !== undefined && (
                        <Linha style={{ padding: '30px 20px 10px 20px' }}>
                          <h6 style={{ fontWeight: '900' }}>Resumo Vendas</h6>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total clientes:
                            </Labels>
                            <Labels>{this.props.data.totalClientes}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Fora de rota:
                            </Labels>
                            <Labels>{this.props.data.foraRota}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % positivação:
                            </Labels>
                            <Labels>{this.props.data.percentPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % negativação:
                            </Labels>
                            <Labels>{this.props.data.percentMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes posit.:
                            </Labels>
                            <Labels>{this.props.data.clientesPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes negat.:
                            </Labels>
                            <Labels>{this.props.data.clientesMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total volume:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVolume, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total peso:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalPeso, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total geral:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalValor)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total venda:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVenda)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á prazo:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAprazo)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á vista:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAvista)}</Labels>
                          </Linha>
                        </Linha>
                      )}
                    </IndicatorsLine>
                  </>
                )}
                {totalizador === 3 && (
                  <>
                    <Linha>
                      <ReactToPrint
                        documentTitle={'Rel. Histórico Saldo de Desconto Flexível'}
                        onBeforeGetContent={() => {
                          this.setState({ imprimindo: true });
                        }}
                        onAfterPrint={() => {
                          this.setState({ imprimindo: false });
                        }}
                        trigger={() => {
                          // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                          // to the root node of the returned component as it will be overwritten.
                          return (
                            <Line>
                              <button className="waves-effect waves-light saib-button is-primary">
                                <Icon>print</Icon>
                              </button>
                            </Line>
                          );
                        }}
                        content={() => this.componentRef}
                      />
                    </Linha>
                    <IndicatorsLine ref={(el) => (this.componentRef = el)} style={{ marginBottom: '30px' }}>
                      <Linha style={{ width: '100%' }}>
                        <ReportHeader title={'Rel. Vendas e Metas Equipes'} filter={filter} />
                      </Linha>
                      {data.map((customer) => (
                        <>
                          <Linha style={{ width: '100%' }} className="subTituloRotas1">
                            <DivDetalhe>
                              <h6 className="titulo">Cliente: {customer.name}</h6>
                            </DivDetalhe>
                            <DivDetalhe>
                              <h6 className="titulo">Rota: {customer.route}</h6>
                            </DivDetalhe>
                            <DivDetalhe>
                              <h6 className="titulo">Total: {formatFloatBr(customer.total)}</h6>
                            </DivDetalhe>
                          </Linha>
                          <table
                            style={{
                              fontSize: '0.8rem',
                              color: '#858585',
                            }}
                          >
                            <thead
                              style={{
                                fontWeight: '700',
                                width: '100%',
                                top: '-10px',
                                position: 'sticky',
                                backgroundColor: 'white',
                                padding: '10px 0px',
                              }}
                            >
                              <td id="product">Produto</td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Marca
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Un
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Prc. médio
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Vda. valor
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Meta valor
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Dif.
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Vda. qtde
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Meta qtde
                              </td>
                              <td
                                id="indicator"
                                style={{
                                  paddingRight: '10px !important',
                                }}
                              >
                                Dif.
                              </td>
                            </thead>
                            {customer.products.map((dataItem) => (
                              <>
                                {(dataItem.vendaQuantidade !== 0 ||
                                  dataItem.vendaValor !== 0 ||
                                  dataItem.metaValor !== 0 ||
                                  dataItem.metaQuantidade !== 0) && (
                                    <>
                                      <tr
                                        key={dataItem.prodId}
                                        style={{
                                          backgroundColor: dataItem.counter % 2 !== 0 ? 'rgb(223, 178, 251)' : 'white',
                                        }}
                                      >
                                        <td
                                          id="product"
                                          style={{
                                            textTransform: 'capitalize',
                                            fontWeight: '700',
                                          }}
                                        >
                                          {dataItem.codigo + ' - ' + dataItem.descricao.toLowerCase()}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.marca}
                                        </td>{' '}
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.unidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.precoMedio}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.vendaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.metaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {formatFloatBr(dataItem.diferencaValor)}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.vendaQuantidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.metaQuantidade}
                                        </td>
                                        <td
                                          id="indicator"
                                          style={{
                                            fontWeight: '500',
                                          }}
                                        >
                                          {dataItem.diferencaQtde}
                                        </td>
                                      </tr>
                                    </>
                                  )}
                              </>
                            ))}
                          </table>
                        </>
                      ))}
                      {data !== undefined && (
                        <Linha style={{ padding: '30px 20px 10px 20px' }}>
                          <h6 style={{ fontWeight: '900' }}>Resumo Vendas</h6>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total clientes:
                            </Labels>
                            <Labels>{this.props.data.totalClientes}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Fora de rota:
                            </Labels>
                            <Labels>{this.props.data.foraRota}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % positivação:
                            </Labels>
                            <Labels>{this.props.data.percentPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              % negativação:
                            </Labels>
                            <Labels>{this.props.data.percentMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes posit.:
                            </Labels>
                            <Labels>{this.props.data.clientesPositivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Nr. clientes negat.:
                            </Labels>
                            <Labels>{this.props.data.clientesMotivados}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total volume:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVolume, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Total peso:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalPeso, '')}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total geral:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalValor)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total venda:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalVenda)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á prazo:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAprazo)}</Labels>
                          </Linha>
                          <Linha style={{ alignItems: 'center', width: '100%' }}>
                            <Labels
                              fontWeight={700}
                              fontSize={0.8}
                              style={{
                                paddingRight: '10px',
                                minWidth: '130px',
                              }}
                            >
                              Valor total á vista:
                            </Labels>
                            <Labels>{formatFloatBr(this.props.data.totalAvista)}</Labels>
                          </Linha>
                        </Linha>
                      )}
                    </IndicatorsLine>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Container>
    );
  }
}

export default SalesAndTeamGoalsData;
