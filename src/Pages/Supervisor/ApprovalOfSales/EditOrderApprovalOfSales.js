import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Chip, Collapsible, CollapsibleItem, Icon, Modal } from 'react-materialize';
import { IoIosAddCircle, IoIosCheckmarkCircle, IoIosCloseCircle, IoMdOptions, IoMdSave } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';
import { Labels } from '../../Trade/Home/style';
import {
  handleAddSale,
  handleDeleteSale,
  handleEditSale,
  handleFindProduct,
} from '../../Trade/Home/tradeGlobalFunctions';
import { Container } from '../ApprovalOfPurchaseOrder/styles';
import Question from '../../../Components/Globals/Question';
import { getFromStorage } from '../../../services/auth';
import { alerta, formataMoedaPFloat, formatFloatBr, formatOracleDateToBr } from '../../../services/funcoes';
import Header from '../../../Components/System/Header';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import api from '../../../services/api';
import {
  ButtonCheck,
  ButtonDenied,
  CardOrder,
  ContainerCollapsibleAndBtns,
  ContentCollapsible,
  DialogContent,
  DialogOptions,
  TextAreaDiv,
} from './styled';
import { format } from 'date-fns';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import './forced.css';
import SelectQuery from '../../../Components/Globals/SelectQuery';

class EditOrderApprovalOfSales extends Component {
  state = {
    isOpenApprove: false,
    loading: false,
    requests: [],
    valueOrder: 0,
    posInput: false,
    isOpenModalProducts: false,
    products: [],
    cancelOrders: [],
    paymentsConditions: [],
    operations: null,
    currentOrder: null,
    openFilters: false,
    ufs: [],
    citys: [],
    companys: [],
  };

  componentDidMount = async () => {
    const { ITEMS } = this.props.history.location.state;
    await this.carregarVariaveisEstado();
    await this.handleGetParams();
    await this.handleGetPaymentsConditions();

    this.setState({
      requests: ITEMS,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
    });
  };

  handleRemoveProduct = async (index, prod) => {
    let { requests, cancelOrders } = this.state;
    requests[index].ITEMS = requests[index].ITEMS.filter((e) => e.PED_ID !== prod.PED_ID);

    const exist = cancelOrders.find((e) => e === prod.PED_NR_PEDIDO);
    if (!exist && prod.PED_NR_PEDIDO && prod.PED_NR_PEDIDO !== -1) {
      cancelOrders.push(prod.PED_NR_PEDIDO);
    }

    requests[index].SAVE_ORDER = true;

    this.setState({ requests, cancelOrders });
  };

  handleFinished = async (index) => {
    let { empresaAtiva, usuarioAtivo, requests, cancelOrders, operations } = this.state;

    this.setState({ loading: true });
    let order = requests[index];

    await Promise.all(
      cancelOrders.map(async (item) => {
        return await this.handleDeleteProductOrder(item);
      })
    );

    if (order && order.ITEMS.length === 0) {
      await handleDeleteSale(empresaAtiva, usuarioAtivo, order.ATD_ID);
      requests = requests.filter((e) => e.ATD_ID !== order.ATD_ID);
      this.setState({ loading: false, requests });
      return;
    }

    const allValue = order.ITEMS?.every((e) => formataMoedaPFloat(e.PED_VALOR_UNIT));

    if (!allValue) {
      alerta('Informe os valores', 2);
      this.setState({ loading: false });
      return;
    }

    const devolutionsOrders = order.ITEMS.filter(
      (e) => operations.GPA_OPER_ID_CONSIGNACAO_DEV === e.PED_OPER_ID && e.UPDATE
    );
    if (devolutionsOrders && devolutionsOrders.length > 0) {
      order = await this.handleUpdateDevolutions(devolutionsOrders, index);
    }

    order = await this.handleCreateDevolution(order.ITEMS, index);

    if (!order) {
      this.setState({ loading: false });
      return;
    }

    const ITEMS = order.ITEMS?.map((item) => {
      item.PED_VALOR_UNIT = formataMoedaPFloat(item.PED_VALOR_UNIT);
      return {
        PED_OPER_ID: order.ATD_OPER_ID,
        PED_PROD_ID: item.PROD_ID_VENDA || item.PED_PROD_ID || item.PROD_ID,
        PED_QTDE: item.PED_QTDE,
        PED_VALOR_UNIT: formataMoedaPFloat(item.PED_VALOR_UNIT),
        PED_VALOR: formataMoedaPFloat(item.PED_VALOR_UNIT) * item.PED_QTDE,
        PED_ESIN_EMP_ID: item.PED_ESIN_EMP_ID_VENDA || item.PED_ESIN_EMP_ID || order.ATD_EMP_ID,
        PED_ESIN_ID: item.ESIN_ID_VENDA || item.PED_ESIN_ID,
        PED_NR_PEDIDO: item.PED_NR_PEDIDO || item.PED_ID,
        PED_OBS: item.PED_OBS,
        PROD_DESCR: item.PROD_DESCR,
        PRODUTO: item.PRODUTO,
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
      order.ATD_CLI_ID,
      order.ATD_ESTR_ID,
      ATD_VALOR_TOTAL,
      order.ATD_OBS,
      ATD_QTDE_TOTAL,
      ITEMS
    );

    if (res && res.length > 0) {
      requests[index] = res[0];
      this.setState({ requests });
    }

    this.setState({ loading: false });
    this.props.history.push({
      pathname: '/EditOrderApprovalOfSales',
      state: {
        ITEMS: requests,
      },
    });
  };

  handleFinishedDevolution = async (index) => {
    let { empresaAtiva, usuarioAtivo, requests, cancelOrders } = this.state;

    this.setState({ loading: true });
    let order = requests[index];

    if (!order) {
      this.setState({ loading: false });
      return;
    }

    await Promise.all(
      cancelOrders.map(async (id) => {
        return await this.handleDeleteSaleWithDevolution(id);
      })
    );

    if (order && order.ITEMS.length === 0) {
      await handleDeleteSale(empresaAtiva, usuarioAtivo, order.ATD_ID);
      requests = requests.filter((e) => e.ATD_ID !== order.ATD_ID);
      this.setState({ loading: false, requests });
      this.props.history.push({
        pathname: '/EditOrderApprovalOfSales',
        state: {
          ITEMS: requests,
        },
      });
      return;
    }

    const allValue = order.ITEMS?.every((e) => formataMoedaPFloat(e.PED_VALOR_UNIT));

    if (!allValue) {
      alerta('Informe os valores', 2);
      this.setState({ loading: false });
      return;
    }

    const ITEMS = order.ITEMS?.map((item) => {
      item.PED_VALOR_UNIT = formataMoedaPFloat(item.PED_VALOR_UNIT);
      return {
        PED_OPER_ID: item.PED_OPER_ID || order.ATD_OPER_ID,
        PED_PROD_ID: item.PROD_ID_VENDA || item.PED_PROD_ID || item.PROD_ID,
        PED_QTDE: item.PED_QTDE,
        PED_VALOR_UNIT: formataMoedaPFloat(item.PED_VALOR_UNIT),
        PED_VALOR: formataMoedaPFloat(item.PED_VALOR_UNIT) * item.PED_QTDE,
        PED_ESIN_EMP_ID: item.PED_ESIN_EMP_ID_VENDA || item.PED_ESIN_EMP_ID || order.ATD_EMP_ID,
        PED_ESIN_ID: item.ESIN_ID_VENDA || item.PED_ESIN_ID,
        PED_OBS: item.PED_NR_PEDIDO,
        PROD_DESCR: item.PROD_DESCR,
        PRODUTO: item.PRODUTO,
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
      order.ATD_CLI_ID,
      order.ATD_ESTR_ID,
      ATD_VALOR_TOTAL,
      order.ATD_OBS,
      ATD_QTDE_TOTAL,
      ITEMS
    );

    if (res && res.length > 0) {
      requests[index] = res[0];
      this.setState({ requests });

      await this.handleUpdateSale(res[0].ITEMS, index);
    }

    this.setState({ loading: false });
    this.props.history.push({
      pathname: '/EditOrderApprovalOfSales',
      state: {
        ITEMS: requests,
      },
    });
  };

  handleUpdateSale = async (products) => {
    try {
      let { empresaAtiva, usuarioAtivo, requests, operations } = this.state;
      await Promise.all(
        products.map(async (ele) => {
          const params = {
            ped_nr_pedido: Number(ele.PED_OBS),
          };

          const res = await api.get(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, {
            params,
          });

          const { sucess, data } = res.data;

          const dataParse = data.find((e) => operations.GPA_OPER_ID_CONSIGNACAO_DEV !== e.ATD_OPER_ID);

          if (sucess && dataParse) {
            const payload = dataParse;
            const pos = payload.ITEMS.findIndex((e) => e.PED_NR_PEDIDO === Number(ele.PED_OBS));

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
              data[0].ITEMS
            );

            if (update && update.length > 0) {
              const pos = requests.findIndex((e) => e.ATD_ID === data[0].ATD_ID);

              update[0].ITEMS = update[0].ITEMS.map((element) => {
                element.PED_OBS = ele.ATD_ID;
                return element;
              });

              if (pos !== -1) {
                requests[pos].ITEMS = [...update[0].ITEMS];
                requests[pos].ATD_VALOR_TOTAL = requests[pos].ITEMS.reduce(
                  (accumulator, currentValue) =>
                    formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
                  0
                );

                requests[pos].ATD_QTDE_TOTAL = requests[pos].ITEMS.reduce(
                  (accumulator, currentValue) =>
                    formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
                  0
                );
              }

              this.setState({ requests });
            }
          }
        })
      );
    } catch (error) {
      // console.log(error);
    }
  };

  handleDeleteSaleWithDevolution = async (id) => {
    try {
      let { empresaAtiva, usuarioAtivo, requests, operations } = this.state;
      const params = {
        ped_nr_pedido: Number(id),
      };

      const res = await api.get(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, {
        params,
      });

      const { sucess, data } = res.data;

      const dataParse = data.find((e) => operations.GPA_OPER_ID_CONSIGNACAO_DEV !== e.ATD_OPER_ID);

      if (sucess && dataParse) {
        const payload = dataParse;
        payload.ITEMS = payload.ITEMS.filter((e) => e.PED_NR_PEDIDO !== id);

        if (payload.ITEMS && payload.ITEMS.length === 0) {
          await handleDeleteSale(empresaAtiva, usuarioAtivo, payload.ATD_ID);
          requests = requests.filter((e) => e.ATD_ID !== payload.ATD_ID);
          return;
        }

        const ATD_VALOR_TOTAL = payload.ITEMS.reduce(
          (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
          0
        );

        const ATD_QTDE_TOTAL = payload.ITEMS.reduce(
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
          data[0].ITEMS
        );

        if (update && update.length > 0) {
          const pos = requests.findIndex((e) => e.ATD_ID === data[0].ATD_ID);

          if (pos !== -1) {
            requests[pos].ITEMS = [...update[0].ITEMS];
            requests[pos].ATD_VALOR_TOTAL = requests[pos].ITEMS.reduce(
              (accumulator, currentValue) =>
                formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
              0
            );

            requests[pos].ATD_QTDE_TOTAL = requests[pos].ITEMS.reduce(
              (accumulator, currentValue) =>
                formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
              0
            );
          }

          this.setState({ requests });
        }
      }
    } catch (error) {
      // console.log(error);
    }
  };

  handleCreateDevolution = async (products, indexOrder) => {
    try {
      const { operations, requests } = this.state;
      const order = requests[indexOrder];

      await Promise.all(
        products.map(async (item, index) => {
          if (item.CLI_ID !== -1 && !item.PED_ID) {
            item.PED_VALOR_UNIT = formataMoedaPFloat(item.PED_VALOR_UNIT);

            if (item.ESIN_ID !== -1) {
              item.PED_ESIN_ID = item.ESIN_ID;
            }

            delete item.ESIN_ID;

            const ITEMS = [
              {
                PED_ESIN_EMP_ID: item.ESIN_EMP_ID,
                PED_OPER_ID: operations.GPA_OPER_ID_CONSIGNACAO_DEV,
                PED_PROD_ID: item.PROD_ID,
                PED_QTDE: item.QTDE_PEDIDO,
                PED_VALOR_UNIT: formataMoedaPFloat(item.PED_VALOR_UNIT),
                PED_VALOR: formataMoedaPFloat(item.PED_VALOR_UNIT) * item.QTDE_PEDIDO,
                PED_GEN_ID_TAB_PRECO: operations.GPA_GEN_ID_TAB_PRECO_DEV,
                PED_NR_PEDIDO: index,
              },
            ];

            const ATD_VALOR_TOTAL = formataMoedaPFloat(item.PED_VALOR) * item.QTDE_PEDIDO;

            const ATD_QTDE_TOTAL = item.QTDE_PEDIDO;

            const obs = `NF: ${item.ESIN_NOTA_FISCAL}`;

            const sessao = getFromStorage();
            const OPER_ID = operations.GPA_OPER_ID_CONSIGNACAO_DEV;

            const res = await handleAddSale(
              null,
              OPER_ID,
              item.ESIN_EMP_ID,
              sessao.codigoUsuario,
              item.CLI_ID,
              order.ATD_ESTR_ID,
              ATD_VALOR_TOTAL,
              obs,
              ATD_QTDE_TOTAL,
              ITEMS
            );

            if (res && res.length > 0) {
              res[0].ITEMS = res[0].ITEMS.map((element) => {
                if (element?.PED_NR_PEDIDO === index) {
                  element.PED_ESIN_EMP_ID_VENDA = item.PED_ESIN_EMP_ID_VENDA;
                  element.ESIN_ID_VENDA = item.ESIN_ID_VENDA;
                  element.PROD_ID_VENDA = item.PROD_ID_VENDA;
                }
                element.PED_NR_PEDIDO = element.PED_ID;
                return element;
              });

              requests[indexOrder].ITEMS[index] = res[0].ITEMS[0];

              this.setState({ requests });

              return requests;
            } else {
              return item;
            }
          }
        })
      );
      return requests[indexOrder];
    } catch (error) {
      alerta('Não foi possível adicionar os novos produtos');
      return false;
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
            data[0].ITEMS
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

  handleSearchProduct = async () => {
    const { searchProduct } = this.state;

    if (!searchProduct) {
      alerta('Informe algum produto', 1);
      return;
    }
    this.setState({ loading: true });
    const sessao = getFromStorage();
    let res = await handleFindProduct(sessao.empresaId, sessao.codigoUsuario, searchProduct);
    if (res) {
      const ufs = [];
      const citys = [];
      const companys = [];

      res.forEach((item) => {
        const existUf = ufs.find((e) => e === item.UF);
        const existCity = ufs.find((e) => e === item.CIDADE);
        const existCompany = ufs.find((e) => e === item.CODIGO);

        if (!existUf) {
          ufs.push(item);
        }
        if (!existCity) {
          citys.push(item);
        }
        if (!existCompany) {
          companys.push(item);
        }
      });

      let ufsChips = {};

      for (const uf of ufs) {
        let item = `${uf.UF}`;
        ufsChips[item] = null;
      }
      let citysChips = {};

      for (const uf of citys) {
        let item = `${uf.CIDADE}`;
        citysChips[item] = null;
      }
      let companysChips = {};

      for (const uf of companys) {
        let item = `${uf.NOME_FANTASIA}`;
        companysChips[item] = null;
      }

      this.setState({ products: res, ufsChips, citysChips, companysChips });
    } else {
      alerta('Não foi possível buscar os dados, verifique sua conexão com a internet', 2);
    }
    this.setState({ loading: false });
  };

  handleAddProduct = (prod) => {
    let { requests, products, empresaAtiva, currentOrder } = this.state;
    const posExist = requests[currentOrder].ITEMS.findIndex(
      (e) => e.PROD_ID === prod.PROD_ID && e.CODIGO === prod.CODIGO && e.SERIE === prod.SERIE
    );

    const productAux = products.find(
      (e) => e.CODIGO_INTEGRACAOO === prod.CODIGO_INTEGRACAOO && e.ESIN_EMP_ID === empresaAtiva
    );

    if (!productAux) {
      alerta('O produto não está cadastrado na empresa atual', 2);
      return;
    }

    if (posExist !== -1) {
      if (
        requests[currentOrder].ITEMS[posExist].QTDE_PEDIDO + 1 <=
        requests[currentOrder].ITEMS[posExist].QTDE_ORIGIN - requests[currentOrder].ITEMS[posExist].QTDE_UTILIZADA
      ) {
        requests[currentOrder].ITEMS[posExist].QTDE_PEDIDO += 1;
        requests[currentOrder].ITEMS[posExist].QTDE -= 1;
        requests[currentOrder].ITEMS[posExist].PED_QTDE += 1;
        requests[currentOrder].ITEMS[posExist].PROD_ID = prod.PROD_ID;
        requests[currentOrder].ITEMS[posExist].PROD_DESCR = prod.PRODUTO;

        requests[currentOrder].ITEMS[posExist].PROD_ID_VENDA = productAux?.PROD_ID || prod.PROD_ID;
        requests[currentOrder].ITEMS[posExist].ESIN_ID_VENDA = productAux?.ESIN_ID !== -1 ? productAux?.ESIN_ID : null;
        requests[currentOrder].ITEMS[posExist].ESIN_EMP_ID_VENDA = productAux?.ESIN_EMP_ID || prod.ESIN_EMP_ID;

        alerta('Produto adicionado', 1);
      }
    } else {
      prod.QTDE_PEDIDO = 1;
      prod.QTDE_ORIGIN = prod.QTDE;
      prod.PROD_DESCR = prod.PRODUTO;
      prod.PED_QTDE = 1;
      prod.QTDE -= 1;

      prod.PROD_ID_VENDA = productAux?.PROD_ID || prod.PROD_ID;
      prod.ESIN_ID_VENDA = productAux?.ESIN_ID !== -1 ? productAux?.ESIN_ID : null;
      prod.ESIN_EMP_ID_VENDA = productAux?.ESIN_EMP_ID || prod.ESIN_EMP_ID;
      requests[currentOrder].ITEMS.push(prod);
      alerta('Produto adicionado', 1);
    }

    requests[currentOrder].NEW_PRODUCT = true;
    requests[currentOrder].SAVE_ORDER = true;
    this.setState({ requests });
  };

  handleGetParams = async () => {
    try {
      this.setState({ loading: true });

      const res = await api.get('v1/params');
      const { sucess, data } = res.data;

      if (sucess) {
        this.setState({ operations: data });
      }
    } catch (error) {
    } finally {
      this.setState({ loading: false });
    }
  };

  handleGetPaymentsConditions = async () => {
    try {
      this.setState({ loading: true });

      const res = await api.get('v1/payments_conditions');
      const { sucess, data } = res.data;

      if (sucess) {
        const paymentsConditions = [];
        data.forEach((item) => {
          paymentsConditions.push({
            label: `${item.GPG_CODIGO} - ${item.GPG_DESCRICAO}`,
            id: item.GPG_CODIGO,
          });
        });
        this.setState({ paymentsConditions });
      }
    } catch (error) {
    } finally {
      this.setState({ loading: false });
    }
  };

  handleApproveAll = async (index) => {
    try {
      const { empresaAtiva, usuarioAtivo, requests } = this.state;

      if (requests[index].PAGAMENTOS.length === 0) {
        alerta('Informe a forma de pagamento', 2);
        return;
      }
      if (requests[index].ATD_TIPO_FRETE === null) {
        alerta('Informe o tipo de frete', 2);
        return;
      }
      this.setState({ loading: true });

      const allValue = requests[index].ITEMS?.every((e) => formataMoedaPFloat(e.PED_VALOR_UNIT));

      if (!allValue) {
        alerta('Informe os valores', 2);
        this.setState({ loading: false });
        return;
      }

      const ATD_VALOR_TOTAL = requests[index].ITEMS.reduce(
        (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
        0
      );

      const ATD_QTDE_TOTAL = requests[index].ITEMS.reduce(
        (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
        0
      );

      const idsUnicos = new Set();

      const arrayAux = requests[index].ITEMS.filter((item) => {
        if (!idsUnicos.has(item.PED_OBS)) {
          idsUnicos.add(item.PED_OBS);
          return true;
        }
        return false;
      });

      await Promise.all(
        arrayAux.map(async (ele) => {
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
                payload.ITEMS[pos].PED_OBS = ele.PED_OBS;
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
              const dataFormat = new Date(requests[index].ATD_DATA);
              dataFormat.setHours(12, 0, 0, 0);
              payload.ATD_DATA = format(dataFormat, 'yyyy-MM-dd');

              payload.ATD_FLAG_SITUACAO = 'L';
              payload.ATD_VALOR_TOTAL = ATD_VALOR_TOTAL;
              payload.ATD_QTDE_TOTAL = ATD_QTDE_TOTAL;

              const update = await api.post(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, payload);

              const { data: dataUpdate } = update.data;

              if (dataUpdate && dataUpdate.length > 0) {
                dataUpdate[0].ITEMS = dataUpdate[0].ITEMS.map((element) => {
                  if (element?.PED_NR_PEDIDO === ele.PED_NR_PEDIDO) {
                    element.PED_ESIN_ID = ele.PED_ESIN_ID;
                    element.PED_ESIN_EMP_ID =
                      ele.PED_ESIN_EMP_ID_VENDA || ele.PED_ESIN_EMP_ID || requests[index].ATD_EMP_ID;
                    element.PED_PROD_ID = ele.PED_PROD_ID;
                    element.PED_OPER_ID = ele.PED_OPER_ID;
                    element.PED_OBS = ele.PED_OBS;
                  }
                  element.PED_NR_PEDIDO = element.PED_ID;

                  return element;
                });
                const posRequest = requests.findIndex(e => e.ATD_ID === payload.ATD_ID)

                if (posRequest !== -1) {
                  requests[posRequest] = dataUpdate[0]
                }

                requests[index].ITEMS = requests[index].ITEMS.filter((e) => e.PED_NR_PEDIDO !== ele.PED_NR_PEDIDO);
                requests[index].ITEMS = [...requests[index].ITEMS, ...dataUpdate[0].ITEMS];

                this.setState({ requests });
              }
            }

        })
      );

      requests[index].ATD_FLAG_SITUACAO = 'L';
      const dataFormat = new Date(requests[index].ATD_DATA);
      dataFormat.setHours(12, 0, 0, 0);

      requests[index].ATD_VALOR_TOTAL = ATD_VALOR_TOTAL;
      requests[index].ATD_QTDE_TOTAL = ATD_QTDE_TOTAL;
      requests[index].ATD_DATA = format(dataFormat, 'yyyy-MM-dd');

      const update = await api.post(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, requests[index]);

      const { sucess: success } = update.data;

      if (success) {
        alerta('Pedido aprovado com sucesso!', 1);
        this.setState({ requests });
        this.props.history.push({
          pathname: '/EditOrderApprovalOfSales',
          state: {
            ITEMS: requests,
          },
        });
      }
    } catch (error) {
      alerta('Não foi possível aprovar o pedido', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDenyAll = async (index) => {
    try {
      const { empresaAtiva, usuarioAtivo, requests } = this.state;
      this.setState({ loading: true });

      const allValue = requests[index].ITEMS?.every((e) => formataMoedaPFloat(e.PED_VALOR_UNIT));

      if (!allValue) {
        alerta('Informe os valores', 2);
        this.setState({ loading: false });
        return;
      }

      const ATD_VALOR_TOTAL = requests[index].ITEMS.reduce(
        (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
        0
      );

      const ATD_QTDE_TOTAL = requests[index].ITEMS.reduce(
        (accumulator, currentValue) => formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
        0
      );

      const idsUnicos = new Set();

      const arrayAux = requests[index].ITEMS.filter((item) => {
        if (!idsUnicos.has(item.PED_OBS)) {
          idsUnicos.add(item.PED_OBS);
          return true;
        }
        return false;
      });

      await Promise.all(
        arrayAux.map(async (ele) => {
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
                payload.ITEMS[pos].PED_OBS = ele.PED_OBS;
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
              const dataFormat = new Date(requests[index].ATD_DATA);
              dataFormat.setHours(12, 0, 0, 0);
              payload.ATD_DATA = format(dataFormat, 'yyyy-MM-dd');

              payload.ATD_FLAG_SITUACAO = 'B';
              payload.ATD_VALOR_TOTAL = ATD_VALOR_TOTAL;
              payload.ATD_QTDE_TOTAL = ATD_QTDE_TOTAL;

              const update = await api.post(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, payload);

              const { data: dataUpdate } = update.data;

              if (dataUpdate && dataUpdate.length > 0) {
                dataUpdate[0].ITEMS = dataUpdate[0].ITEMS.map((element) => {
                  if (element?.PED_NR_PEDIDO === ele.PED_NR_PEDIDO) {
                    element.PED_ESIN_ID = ele.PED_ESIN_ID;
                    element.PED_ESIN_EMP_ID =
                      ele.PED_ESIN_EMP_ID_VENDA || ele.PED_ESIN_EMP_ID || requests[index].ATD_EMP_ID;
                    element.PED_PROD_ID = ele.PED_PROD_ID;
                    element.PED_OPER_ID = ele.PED_OPER_ID;
                    element.PED_OBS = ele.PED_OBS;
                  }
                  element.PED_NR_PEDIDO = element.PED_ID;
                  delete element.PED_ID;

                  return element;
                });

                const posRequest = requests.findIndex(e => e.ATD_ID === payload.ATD_ID)

                if (posRequest !== -1) {
                  requests[posRequest] = dataUpdate[0]
                }
                requests[index].ITEMS = requests[index].ITEMS.filter((e) => e.PED_NR_PEDIDO !== ele.PED_NR_PEDIDO);
                requests[index].ITEMS = [...requests[index].ITEMS, ...dataUpdate[0].ITEMS];

                this.setState({ requests });
              }
            }

        })
      );
      requests[index].ATD_FLAG_SITUACAO = 'B';
      const dataFormat = new Date(requests[index].ATD_DATA);
      dataFormat.setHours(12, 0, 0, 0);

      requests[index].ATD_VALOR_TOTAL = ATD_VALOR_TOTAL;
      requests[index].ATD_QTDE_TOTAL = ATD_QTDE_TOTAL;
      requests[index].ATD_DATA = format(dataFormat, 'yyyy-MM-dd');

      const update = await api.post(`v1/approvalofsales/sales/${empresaAtiva}/${usuarioAtivo}`, requests[index]);

      const { sucess: success } = update.data;

      if (success) {
        alerta('Pedido negado com sucesso!', 1);
        this.setState({ requests });
        this.props.history.push({
          pathname: '/EditOrderApprovalOfSales',
          state: {
            ITEMS: requests,
          },
        });
      }
    } catch (error) {
      alerta('Não foi possível negar o pedido', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleUpdateDevolutions = async (products, indexOrder) => {
    try {
      let { empresaAtiva, usuarioAtivo, requests } = this.state;
      await Promise.all(
        products.map(async (ele) => {
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
              data[0].ITEMS
            );

            if (update && update.length > 0) {
              const newRequests = requests[pos]?.ITEMS?.filter(
                (e) => !data[0].ITEMS.find((ele) => e.PED_NR_PEDIDO === ele.PED_ID)
              );

              update[0].ITEMS = update[0].ITEMS.map((element) => {
                if (element?.PED_NR_PEDIDO === ele.PED_NR_PEDIDO) {
                  element.PED_ESIN_ID = ele.PED_ESIN_ID;
                  element.PED_ESIN_EMP_ID = ele.PED_ESIN_EMP_ID;
                  element.PED_PROD_ID = ele.PED_PROD_ID;
                  element.PED_OPER_ID = ele.PED_OPER_ID;
                }
                element.PED_NR_PEDIDO = element.PED_ID;
                return element;
              });

              requests[indexOrder].ITEMS = [...(newRequests || []), ...update[0].ITEMS];
              requests[indexOrder].ATD_VALOR_TOTAL = requests[indexOrder].ITEMS.reduce(
                (accumulator, currentValue) =>
                  formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_VALOR),
                0
              );

              requests[indexOrder].ATD_QTDE_TOTAL = requests[indexOrder].ITEMS.reduce(
                (accumulator, currentValue) =>
                  formataMoedaPFloat(accumulator) + formataMoedaPFloat(currentValue.PED_QTDE),
                0
              );

              this.setState({ requests });
            }
          }
        })
      );
      return requests[indexOrder];
    } catch (error) {
      // console.log(error);
    }
  };

  handleSelectCod = (value, index) => {
    const { requests } = this.state;
    if (value) {
      requests[index].PAGAMENTOS = [value.id];
      this.setState({ requests });
    } else {
      requests[index].PAGAMENTOS = [];
      this.setState({ requests });
    }
  };

  handleSelectFrete = (e, index) => {
    const { requests } = this.state;
    if (e) {
      requests[index].ATD_TIPO_FRETE = e.value;
      this.setState({ requests });
    } else {
      requests[index].ATD_TIPO_FRETE = null;
      this.setState({ requests });
    }
  };

  render() {
    const {
      isOpenModalProducts,
      loading,
      requests,
      valueOrder,
      posInput,
      searchProduct,
      products,
      operations,
      openFilters,
      ufsChips,
      citysChips,
      companysChips,
      citysSelects,
      ufsSelects,
      companysSelects,
      namesCitys,
      namesUfs,
      namesCompanys,
      optionFilterSituation,
      paymentsConditions,
      isOpenApprove,
    } = this.state;

    let productsFilter = products.filter((e) => e.QTDE - e.QTDE_UTILIZADA > 0);
    if (namesCitys && namesCitys.length > 0) {
      productsFilter = productsFilter.filter((e) => namesCitys.includes(this.removeAcent(e.CIDADE)));
    }
    if (namesUfs && namesUfs.length > 0) {
      productsFilter = productsFilter.filter((e) => namesUfs.includes(this.removeAcent(e.UF)));
    }
    if (namesCompanys && namesCompanys.length > 0) {
      productsFilter = productsFilter.filter((e) => namesCompanys.includes(this.removeAcent(e.NOME_FANTASIA)));
    }

    if (optionFilterSituation === '1') {
      productsFilter = productsFilter.filter((e) => e.LOCALIZACAO === 'EM_ESTOQUE');
    } else if (optionFilterSituation === '2') {
      productsFilter = productsFilter.filter((e) => e.LOCALIZACAO === 'CONSIGNADO');
    }

    return (
      <>
        <WaitScreen loading={loading} />
        <Header />
        <Container>
          <DirectTituloJanela
            stateUrl={'/ApprovalOfSales'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>event_note</Icon>Editar pedido
                </span>
              )
            }
          />
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              width: '100%',
              padding: '0.5rem',
            }}
          >
            {requests.map((prod, indexOrder) => (
              <CardOrder
                key={prod.ATD_ID}
                typeOrder={operations.GPA_OPER_ID_CONSIGNACAO_DEV === prod.ATD_OPER_ID ? 'true' : 'false'}
              >
                <div>
                  <span style={{ fontWeight: '700' }}>{prod.CLI_NOME_FANTASIA}</span>
                  <span>{format(new Date(prod.ATD_DATA), 'dd/MM/yyyy')}</span>
                </div>
                <div>
                  <span
                    style={{
                      width: '110px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color:
                        prod.ATD_FLAG_SITUACAO === 'L'
                          ? '#14532d'
                          : prod.ATD_FLAG_SITUACAO === 'B'
                          ? '#ed3241'
                          : '#006ffd',
                    }}
                  >
                    {prod.ATD_FLAG_SITUACAO === 'L' && 'Liberado'}
                    {prod.ATD_FLAG_SITUACAO === 'B' && 'Bloqueado'}
                    {prod.ATD_FLAG_SITUACAO === 'P' && 'Pendente'}
                  </span>
                  <span
                    style={{
                      fontWeight: '700',
                      color: operations.GPA_OPER_ID_CONSIGNACAO_DEV === prod.ATD_OPER_ID ? '#8e44ad' : '#523FBA',
                      textAlign: 'right',
                      textDecoration: 'underline',
                    }}
                  >
                    {operations.GPA_OPER_ID_CONSIGNACAO_DEV === prod.ATD_OPER_ID ? 'DEVOLUÇÃO' : 'VENDA'}
                  </span>
                </div>
                {prod.ATD_FLAG_SITUACAO === 'L' && (
                  <div>
                    <span style={{ fontWeight: '600' }}>Cód pagamento: {requests[indexOrder].PAGAMENTOS[0]}</span>
                    <span style={{ fontWeight: '600' }}>Tipo frete: {requests[indexOrder].ATD_TIPO_FRETE}</span>
                  </div>
                )}

                <div>
                  <span>Produtos: {prod.ATD_QTDE_TOTAL}</span>
                  <span style={{ fontWeight: '700' }}>Valor: {formatFloatBr(prod.ATD_VALOR_TOTAL)}</span>
                </div>
                <span style={{ fontWeight: '700', borderBottom: '1px solid #ccc', marginTop: '0.5rem' }}>PRODUTOS</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {prod.ATD_FLAG_SITUACAO !== 'L' && operations.GPA_OPER_ID_CONSIGNACAO_DEV !== prod.ATD_OPER_ID && (
                    <Button
                      onClick={() => {
                        this.setState({ isOpenModalProducts: true, currentOrder: indexOrder });
                      }}
                      style={{ fontSize: '1rem' }}
                      className="waves-effect waves-light saib-button is-primary"
                    >
                      <i>
                        <IoIosAddCircle size={16} style={{ marginRight: '0.2rem' }} />
                      </i>
                      Add produto
                    </Button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <div style={{ width: '16px', height: '16px', background: '#523FBA' }} />
                      <span style={{ fontSize: '1rem' }}>Venda</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <div style={{ width: '16px', height: '16px', background: '#8e44ad' }} />
                      <span style={{ fontSize: '1rem' }}>Devolução</span>
                    </div>
                  </div>
                </div>
                {prod.ITEMS.map((prodItem, index) => (
                  <ContainerCollapsibleAndBtns key={prodItem.PED_ID}>
                    <ContentCollapsible
                      type={operations.GPA_OPER_ID_CONSIGNACAO_DEV === prodItem.PED_OPER_ID ? 'true' : 'false'}
                      className="collapsibleEditOrderDirect"
                    >
                      <Collapsible
                        accordion={false}
                        style={{
                          width: '100%',
                          borderStyle: 'none',
                          boxShadow: 'none',
                        }}
                        className="collapsibleEditOrderDirect"
                      >
                        <CollapsibleItem
                          className="collapsibleEditOrderDirectItem"
                          expanded={!prodItem.PED_VALOR_UNIT ? true : false}
                          icon={
                            <>
                              <p className="material-icons plus">add_circle_outline</p>

                              <p className="material-icons minus">remove_circle_outline</p>
                            </>
                          }
                          header={<p style={{ fontWeight: '700', fontSize: '1rem' }}>{prodItem.PROD_DESCR}</p>}
                          node="div"
                        >
                          <div
                            className="card"
                            style={{
                              fontSize: '16px',
                              width: '100%',
                              borderRadius: '5px',
                              border: '1px solid',
                              borderColor:
                                operations.GPA_OPER_ID_CONSIGNACAO_DEV === prodItem.PED_OPER_ID ? '#8e44ad' : '#523FBA',
                            }}
                          >
                            {operations.GPA_OPER_ID_CONSIGNACAO_DEV === prodItem.PED_OPER_ID && (
                              <p
                                style={{
                                  padding: '0 0.2rem',
                                  fontSize: '0.9rem',
                                  fontWeight: '700',
                                  textDecoration: 'underline',
                                }}
                              >
                                DEVOLUÇÃO
                              </p>
                            )}
                            {(prodItem.ESIN_LOTE || prodItem.LOTE) && (
                              <p style={{ padding: '0 0.2rem', fontSize: '0.8rem' }}>
                                <strong>Lote: </strong> {prodItem.ESIN_LOTE || prodItem.LOTE}
                              </p>
                            )}
                            {(prodItem.ESIN_SERIE || prodItem.SERIE) && (
                              <p style={{ padding: '0 0.2rem', fontSize: '0.8rem' }}>
                                <strong>Série: </strong> {prodItem.ESIN_SERIE || prodItem.SERIE}
                              </p>
                            )}
                            <p style={{ padding: '0 0.2rem', fontSize: '0.8rem' }}>
                              <strong>Qtde: </strong> {prodItem.PED_QTDE}
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 0.2rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.8rem',
                              }}
                            >
                              <p>
                                <strong>Valor unitário: </strong>{' '}
                                {formatFloatBr(formataMoedaPFloat(prodItem.PED_VALOR_UNIT))}
                              </p>
                              {prod && prod.ITEMS.length > 0 && prod.ATD_FLAG_SITUACAO !== 'L' && !prod.NEW_PRODUCT
                                && <Button
                                onClick={() => {
                                  this.setState({
                                    valueOrder: formatFloatBr(formataMoedaPFloat(prodItem.PED_VALOR_UNIT)) || 0,
                                    posInput: index,
                                  });
                                  setTimeout(() => {
                                    const doc = document.getElementById(`valor${index}`);
                                    if (doc) {
                                      document.getElementById(`valor${index}`).focus();
                                    }
                                  }, 200);
                                }}
                                style={{
                                  marginLeft: '0.5rem',
                                  padding: '2px',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '100%',
                                }}
                                className="waves-effect waves-light saib-button is-primary"
                              >
                                <i className="iconOrderDirect">
                                  <RiPencilFill size={16} />
                                </i>
                              </Button>
                              }

                            </div>
                            {typeof posInput === 'number' && posInput === index && (
                              <div style={{ padding: '0 0.2rem' }}>
                                <strong style={{ color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>
                                  Informe o valor unitário
                                </strong>

                                <input
                                  style={{ fontSize: '0.9rem' }}
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
                                      requests[indexOrder].ITEMS[index].UPDATE = true;
                                      requests[indexOrder].SAVE_ORDER = true;
                                      requests[indexOrder].ITEMS[index].PED_VALOR_UNIT = formataMoedaPFloat(valueOrder);
                                      requests[indexOrder].ITEMS[index].PED_VALOR =
                                        formataMoedaPFloat(valueOrder) * prodItem.PED_QTDE;
                                      this.setState({ requests, valueOrder: false, posInput: false });
                                    }
                                  }}
                                />
                                <Button
                                  onClick={async () => {
                                    requests[indexOrder].ITEMS[index].UPDATE = true;
                                    requests[indexOrder].SAVE_ORDER = true;
                                    requests[indexOrder].ITEMS[index].PED_VALOR_UNIT = formataMoedaPFloat(valueOrder);
                                    requests[indexOrder].ITEMS[index].PED_VALOR =
                                      formataMoedaPFloat(valueOrder) * prodItem.PED_QTDE;
                                    this.setState({ requests, valueOrder: false, posInput: false });
                                  }}
                                  style={{
                                    gap: '0.3rem',
                                    marginBottom: '0.5rem',
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    fontSize: '1rem',
                                  }}
                                  className="waves-effect waves-light saib-button is-primary"
                                >
                                  <Icon>check_circle</Icon>
                                  Confirmar
                                </Button>
                              </div>
                            )}
                            {prodItem.PED_VALOR && (
                              <p style={{ padding: '0 0.2rem', fontSize: '0.8rem' }}>
                                <strong>Valor total: </strong> {formatFloatBr(prodItem.PED_VALOR)}
                              </p>
                            )}

                            {operations.GPA_OPER_ID_CONSIGNACAO_DEV === prodItem.PED_OPER_ID &&
                            prod.ATD_FLAG_SITUACAO === 'P' ? (
                              <ButtonDenied onClick={() => this.handleRemoveProduct(indexOrder, prodItem)}>
                                <IoIosCloseCircle size={18} />
                                Negar
                              </ButtonDenied>
                            ) : (
                              prod.ATD_FLAG_SITUACAO === 'P' && (
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
                                          Tem certeza que deseja remover o produto?
                                        </p>
                                      </div>
                                    }
                                    onNo={() => {}}
                                    onYes={() => {
                                      this.handleRemoveProduct(indexOrder, prodItem);
                                    }}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </CollapsibleItem>
                      </Collapsible>
                    </ContentCollapsible>
                  </ContainerCollapsibleAndBtns>
                ))}

                {prod && prod.ITEMS.length > 0 && (
                  <TextAreaDiv style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ fontWeight: '700', fontSize: '0.8rem', color: '#000' }}>Observação</label>
                    <textarea
                      value={prod.ATD_OBS}
                      onChange={(event) => {
                        requests[indexOrder].SAVE_ORDER = true;
                        prod.ATD_OBS = event.target.value;
                        this.setState({ prod, requests });
                      }}
                      maxLength={300}
                      cols={3}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </TextAreaDiv>
                )}
                {isOpenApprove === indexOrder && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      gap: '0.2rem',
                      width: '100%',
                    }}
                  >
                    <label style={{ fontWeight: '600', fontSize: '1rem', color: '#000' }}>Forma de pagamento</label>
                    <SelectQuery
                      loading={false}
                      itemSelected={requests[indexOrder].PAGAMENTOS[0]}
                      colorPrimary
                      query={paymentsConditions}
                      keys={['label', 'id']}
                      label="label"
                      onSelect={(value) => this.handleSelectCod(value, indexOrder)}
                      onDelete={(value) => {
                        if (prod.ATD_FLAG_SITUACAO !== 'L') {
                          this.handleSelectCod(value, indexOrder);
                        }
                      }}
                    />
                    <label style={{ fontWeight: '600', fontSize: '1rem', color: '#000' }}>Tipo de frete</label>
                    <SelectQuery
                      loading={false}
                      itemSelected={requests[indexOrder].ATD_TIPO_FRETE}
                      colorPrimary
                      query={[
                        { label: 'CIF', value: 'C' },
                        { label: 'FOB', value: 'F' },
                      ]}
                      keys={['label', 'value']}
                      label="label"
                      onSelect={(value) => this.handleSelectFrete(value, indexOrder)}
                      onDelete={(value) => {
                        if (prod.ATD_FLAG_SITUACAO !== 'L') {
                          this.handleSelectFrete(value, indexOrder);
                        }
                      }}
                    />
                  </div>
                )}

                {operations.GPA_OPER_ID_CONSIGNACAO_DEV !== prod.ATD_OPER_ID && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.3rem',
                      width: '100%',
                      marginTop: '0.5rem',
                    }}
                  >
                    {prod && prod.ITEMS.length > 0 && prod.ATD_FLAG_SITUACAO === 'P' && !prod.NEW_PRODUCT && (
                      <ButtonDenied onClick={() => this.handleDenyAll(indexOrder)}>
                        <IoIosCloseCircle size={18} />
                        Negar tudo
                      </ButtonDenied>
                    )}
                    {prod && prod.ITEMS.length > 0 && prod.ATD_FLAG_SITUACAO !== 'L' && !prod.NEW_PRODUCT && (
                      <ButtonCheck
                        onClick={() => {
                          if (isOpenApprove === indexOrder) {
                            this.handleApproveAll(indexOrder);
                          } else {
                            this.setState({ isOpenApprove: indexOrder });
                          }
                        }}
                      >
                        <IoIosCheckmarkCircle size={18} />
                        Aprovar tudo
                      </ButtonCheck>
                    )}
                  </div>
                )}

                {prod.SAVE_ORDER && (
                  <Button
                    onClick={() => {
                      if (operations.GPA_OPER_ID_CONSIGNACAO_DEV !== prod.ATD_OPER_ID) {
                        this.handleFinished(indexOrder);
                      } else {
                        this.handleFinishedDevolution(indexOrder);
                      }
                    }}
                    className="waves-effect waves-light saib-button is-primary"
                  >
                    <IoMdSave size={18} style={{ marginRight: '0.4rem' }} />
                    Salvar
                  </Button>
                )}
                {isOpenModalProducts && (
                  <Modal
                    className="modalProductsEditOrder"
                    actions={[
                      <>
                        <Button
                          className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                          onClick={() => {
                            this.setState({ isOpenModalProducts: false });
                          }}
                          color="primary"
                        >
                          Fechar
                        </Button>
                      </>,
                    ]}
                    bottomSheet={false}
                    fixedFooter={true}
                    header={`Buscar produtos`}
                    options={{
                      dismissible: true,
                      endingTop: '10%',
                      inDuration: 0,
                      onCloseStart: null,
                      onOpenEnd: null,
                      opacity: 0.5,
                      outDuration: 0,
                      preventScrolling: true,
                      startingTop: '15%',
                      onCloseEnd: () => {
                        this.setState({
                          isOpenModalProducts: false,
                        });
                      },
                    }}
                    open={isOpenModalProducts}
                  >
                    <div
                      style={{
                        overflowY: 'unset',
                        overflowX: 'hidden',
                        height: 'unset',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px', width: '99%' }}>
                        <Labels>Buscar produto</Labels>
                        <input
                          type="text"
                          value={searchProduct}
                          onChange={(event) => this.setState({ searchProduct: event.target.value })}
                          onKeyUp={(event) => {
                            if (event.key === 'Enter') {
                              this.handleSearchProduct();
                            }
                          }}
                        />
                        <Button
                          style={{ width: '100%' }}
                          onClick={() => this.handleSearchProduct()}
                          className="waves-effect waves-light saib-button is-primary"
                        >
                          <Icon>search</Icon>
                          Pesquisar
                        </Button>
                      </div>
                      {products && products.length > 0 && (
                        <Button
                          onClick={() => this.setState({ openFilters: !openFilters })}
                          className="waves-effect waves-light saib-button is-primary"
                        >
                          <IoMdOptions style={{ marginRight: '0.3rem' }} />
                          Filtrar produtos
                        </Button>
                      )}

                      {loading && <span>Carregando...</span>}
                      {productsFilter.map((prod) => (
                        <div
                          className="card"
                          key={`${prod.PROD_ID}_${prod.CODIGO}_${prod.SERIE}`}
                          style={{
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #9545ba',
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
                              {prod.NOME_FANTASIA} - {prod.RAZAO_SOCIAL}
                            </span>
                          </div>
                          <p style={{ padding: '0 0.2rem', fontWeight: '700', fontSize: '1rem' }}>
                            {prod.CODIGO_INTEGRACAOO} - {prod.PRODUTO}
                          </p>
                          <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                            Endereço: {prod.ENDERECO} - {prod.CIDADE} - {prod.UF}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.6rem',
                              padding: '0 0.2rem',
                              fontSize: '1rem',
                            }}
                          >
                            <p>
                              <strong>Lote: </strong>
                              {prod.LOTE}
                            </p>
                            <p>
                              <strong>Série: </strong>
                              {prod.SERIE}
                            </p>
                          </div>
                          <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                            <strong>Qtde:</strong> {prod.QTDE - prod.QTDE_UTILIZADA}
                          </p>
                          {prod.CONTATO && (
                            <p style={{ padding: '0 0.2rem', fontSize: '1rem' }}>
                              <strong>Contato:</strong> {prod.CONTATO}
                            </p>
                          )}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.6rem',
                              padding: '0 0.2rem',
                              fontSize: '1rem',
                            }}
                          >
                            <p>
                              <strong>Validade: </strong>
                              {formatOracleDateToBr(prod.DATA_VALIDADE)}
                            </p>
                            <p
                              style={{
                                color: prod.LOCALIZACAO === 'CONSIGNADO' ? '#ed3241' : '#14532d',
                                fontWeight: '600',
                              }}
                            >
                              {prod.LOCALIZACAO.replaceAll('_', ' ')}
                            </p>
                          </div>
                          <Button
                            onClick={() => this.handleAddProduct(prod)}
                            style={{
                              gap: '0.3rem',
                              margin: '0.6rem 0.2rem 0.2rem',
                              width: '98%',
                            }}
                            className="waves-effect waves-light saib-button is-primary"
                          >
                            Adicionar no pedido
                            <Icon>add</Icon>
                          </Button>
                        </div>
                      ))}
                    </div>

                    {openFilters && (
                      <DialogOptions>
                        <DialogContent>
                          <SaibRadioGroup
                            valueItems={'"1","2", "3"'}
                            classNameItems={'"estoque", "consignado", "all"'}
                            textItems={'"Em estoque","Consignado", "Todos"'}
                            idItems={'"estoqueId", "consignadoId", "allId"'}
                            classNameRadio="filterSituation"
                            flexDirectionRadio="row"
                            disabledRadio="false"
                            defaultCheckedId={'allId'}
                            onChange={async (value) => {
                              this.setState({
                                optionFilterSituation: value,
                              });
                            }}
                          />
                          <div flex={3} className="divDetailGerente">
                            <Labels>Cidade</Labels>
                            <Chip
                              id="cityChips"
                              className="cityChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: citysSelects !== undefined ? citysSelects : [],
                                onChipAdd: this.onChangeSelectCitys,
                                onChipDelete: this.onChangeSelectCitys,
                                autocompleteOptions: {
                                  data: citysChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() {},
                                },
                              }}
                            />
                          </div>
                          <div flex={3} className="divDetailGerente">
                            <Labels>UF</Labels>
                            <Chip
                              id="ufsChips"
                              className="ufsChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: ufsSelects !== undefined ? ufsSelects : [],
                                onChipAdd: this.onChangeSelectUf,
                                onChipDelete: this.onChangeSelectUf,
                                autocompleteOptions: {
                                  data: ufsChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() {},
                                },
                              }}
                            />
                          </div>
                          <div>
                            <Labels>Empresa</Labels>
                            <Chip
                              id="companysChips"
                              className="companysChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: companysSelects !== undefined ? companysSelects : [],
                                onChipAdd: this.onChangeSelectCompany,
                                onChipDelete: this.onChangeSelectCompany,
                                autocompleteOptions: {
                                  data: companysChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() {},
                                },
                              }}
                            />
                          </div>
                          <Button
                            onClick={() => this.setState({ openFilters: false })}
                            className="waves-effect waves-light saib-button is-primary"
                          >
                            Filtrar produtos
                          </Button>
                        </DialogContent>
                      </DialogOptions>
                    )}
                  </Modal>
                )}
              </CardOrder>
            ))}
          </div>
        </Container>
      </>
    );
  }
}

export default withRouter(EditOrderApprovalOfSales);
