import React from 'react';
import { withRouter, BrowserRouter, Route, Switch } from 'react-router-dom';
import { getMenuToStorage } from './services/auth';
import { isAuthenticated } from '../src/services/auth';
import { EnviromentVars } from '../src/config/env';

/* SYSTEM PAGES */
import Login from './Pages/System/Login';
import Home from './Pages/System/Home';
import Expired from './Pages/System/Expired';
/* ADMIN PAGES */
import Users from './Pages/Admin/Users';
import UsersMenu from './Pages/Admin/UsersMenu';
import MovelParams from './Pages/Admin/Params';
/* RESULTS ANALYSIS PAGES */
import KpiDashboard from './Pages/ResultsAnalysis/KpiDashboard';
import ProductDashboard from './Pages/ResultsAnalysis/ProductDashboard';
import MarketingDashboard from './Pages/ResultsAnalysis/MarketingDashboard';
import CustomerDashboard from './Pages/ResultsAnalysis/CustomerDashboard';
/* SUPERVISOR PAGES */
import ApprovalOfVendorFunds from './Pages/Supervisor/ApprovalOfVendorFunds';
import ApprovalOfBusinessRules from './Pages/Supervisor/ApprovalOfBusinessRules';
import ApprovalOfPayments from './Pages/Supervisor/ApprovalOfPayments';
import NotConfirmities from './Pages/Supervisor/NotConformities';
import ApprovalOfPurchaseOrder from './Pages/Supervisor/ApprovalOfPurchaseOrder';
import ApprovalOfSales from './Pages/Supervisor/ApprovalOfSales';
import EditOrderApprovalOfSales from './Pages/Supervisor/ApprovalOfSales/EditOrderApprovalOfSales';
/* LOGISTICS PAGES */
import LogisticsMaisDetalhes from './Pages/Logistics/Home/MaisDetalhes';
/* EXTRACT PAGES */
import HistoryFlexibleDiscountBalance from './Pages/Extracts/HistoryFlexibleDiscountBalance';
import FinancialStatement from './Pages/Extracts/FinancialStatement';
import SupervisorBudget from './Pages/Extracts/SupervisorBudget';
import SalesAndTeamGoals from './Pages/Extracts/SalesAndTeamGoals';
/* FIELD WORK */
import Search from './Pages/FieldWork/Search';
import Searchs from './Pages/FieldWork/Searchs';
import Schedule from './Pages/FieldWork/Schedule';
import Schedules from './Pages/FieldWork/Schedules';
import ManageSchedule from './Pages/FieldWork/ManageSchedule';
import Flows from './Pages/FieldWork/Flows';
import Flow from './Pages/FieldWork/Flow';
import FlexibleSchedule from './Pages/FieldWork/SupervisorSchedules';
/* TRADE */
import StartWorkDay from './Pages/Trade/Home/StartWorkDay';
import ServiceSearchs from './Pages/Trade/Home/ServiceSearchs';
import ServiceEvents from './Pages/Trade/Home/ServiceSearchs/ServiceEvents';
import Conference from './Pages/Trade/Home/ServiceSearchs/AdminModule/Conference';
import Order from './Pages/Trade/Home/ServiceSearchs/AdminModule/Order';
import NewOrder from './Pages/Trade/Home/ServiceSearchs/AdminModule/Order/NewOrder';
import EditOrder from './Pages/Trade/Home/ServiceSearchs/AdminModule/Order/EditOrder';
import CreateOrder from './Pages/Trade/Home/ServiceSearchs/AdminModule/Order/CreateOrder';
import FindProduct from './Pages/Trade/Home/ServiceSearchs/AdminModule/FindProduct';
import OrderDirect from './Pages/Trade/Home/ServiceSearchs/AdminModule/OrderDirect';
import NewOrderDirect from './Pages/Trade/Home/ServiceSearchs/AdminModule/OrderDirect/NewOrder';
import EditOrderDirect from './Pages/Trade/Home/ServiceSearchs/AdminModule/OrderDirect/EditOrderDirect';
import HistoricOrders from './Pages/Trade/Home/ServiceSearchs/AdminModule/HistoricOrders';
import StartSearch from './Pages/Trade/Home/StartSearch';
import StartSearchGrouped from './Pages/Trade/Home/StartSearchGrouped';
import TradeMktDashboard from './Pages/Trade/TradeMktDashboard';
import ProfessionalSchedule from './Pages/Trade/TradeMktDashboard/ProfessionalSchedule';
import ScheduleSearchs from './Pages/Trade/TradeMktDashboard/ScheduleSearchs';
import TradeInterruptions from './Pages/Trade/TradeMktDashboard/TradeInterruptions';

/*INTERRUPTOR*/
import Interruptions from './Pages/FieldWork/Interruptions';
import Interruption from './Pages/FieldWork/Interruption';

/*Justification*/
import Justifications from './Pages/FieldWork/Justifications';
import Justification from './Pages/FieldWork/Justification';
import SchedulePhotos from './Pages/Trade/TradeMktDashboard/SchedulePhotos';

/*Team Marketing*/
import TradesMktTeam from './Pages/FieldWork/TradesMktTeam';
import TradeMktTeam from './Pages/FieldWork/TradeMktTeam';
import EnviarEmail from './Pages/Trade/Home/EnviarEmail';
import Trade from './Pages/Trade/Home';
import TradeAdmin from './Pages/Trade/Home/TradeAdmin';

/* Context API */
import { PanelMonitoringProvider } from './providers/monitoringPanel';
import TradeRoute from './Components/FieldWork/TradeMktDashboard/TradeRoute';

import pdvEvents from './Pages/Events';
import AddEvent from './Pages/Events/AddEvent';

/* Relatorios */
import SearchsReport from './Pages/Trade/Reports/SearchsReport';
import VariableCalcularion from './Pages/Trade/Reports/VariableCalcularion';
import KmDrivenReport from './Pages/Trade/Reports/KmDrivenReport';
import { SearchReportProvider } from './providers/reportSearch';
import TradePosition from './Components/FieldWork/TradeMktDashboard/TopBarInformation/TradePosition';
import ExcelSearchsReports from './Pages/Trade/Reports/ExcelSearchsReports';
import PopUpNotConformitie from './Components/Supervisor/NotConformities/PopUpNotConformitie';
import ExcelScheduleReports from './Pages/Trade/Reports/ExcelScheduleReports';
import AdminModule from './Pages/Trade/Home/ServiceSearchs/AdminModule';
import InventoryModule from './Pages/Trade/Home/ServiceSearchs/AdminModule/InventoryModule';
import FinancialModule from './Pages/Trade/Home/ServiceSearchs/AdminModule/FinancialModule';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (isAuthenticated() ? <Component {...props} /> : <Login />)} />
);

// const Routes = () => (
//   <BrowserRouter>
//     <Switch>
//       <Route path="/" exact component={Login} />
//       <Route path="/login" exact component={Login} />
//       <Route path="/expired" exact component={Expired} />
//       <PrivateRoute path="/marketing" exact component={()=>{
//         window.location.href = EnviromentVars.urlDirectFrontMarketing+'/home';
//         return null;
//       }} />
//       <PrivateRoute path="/operacional" exact component={()=>{
//         window.location.href = EnviromentVars.urlDirectFrontOperacional+'/home';
//         return null;
//       }} />
//       <PrivateRoute path="/home" component={Home} />
//       <PrivateRoute path="/users" component={Users} />
//       <PrivateRoute path="/usersmenu" component={UsersMenu} />
//       <PrivateRoute path="/basicbook" component={BasicBook} />
//       <PrivateRoute path="*" component={Home} />
//     </Switch>
//   </BrowserRouter>
// );

const paginas = [
  PopUpNotConformitie,
  ExcelSearchsReports,
  TradePosition,
  TradeRoute,
  TradeAdmin,
  Trade,
  EnviarEmail,
  SchedulePhotos,
  TradeMktDashboard,
  StartSearchGrouped,
  StartSearch,
  ServiceSearchs,
  ServiceEvents,
  StartWorkDay,
  Conference,
  Order,
  NewOrder,
  EditOrder,
  CreateOrder,
  FindProduct,
  OrderDirect,
  NewOrderDirect,
  EditOrderDirect,
  HistoricOrders,
  Flow,
  Flows,
  Schedules,
  ManageSchedule,
  Schedule,
  Searchs,
  Search,
  ProductDashboard,
  Login,
  Home,
  Expired,
  SalesAndTeamGoals,
  NotConfirmities,
  ApprovalOfBusinessRules,
  ApprovalOfPayments,
  SupervisorBudget,
  FinancialStatement,
  HistoryFlexibleDiscountBalance,
  ApprovalOfVendorFunds,
  MarketingDashboard,
  KpiDashboard,
  TradesMktTeam,
  TradeMktTeam,
  CustomerDashboard,
  Interruption,
  Interruptions,
  Justifications,
  TradeInterruptions,
  Justification,
  ScheduleSearchs,
  Users,
  UsersMenu,
  MovelParams,
  ProfessionalSchedule,
  SearchsReport,
  VariableCalcularion,
  KmDrivenReport,
  ApprovalOfPurchaseOrder,
  ApprovalOfSales,
  EditOrderApprovalOfSales,
  ExcelScheduleReports,
  FlexibleSchedule,
  AdminModule,
  InventoryModule,
  FinancialModule,
  pdvEvents,
  AddEvent
];

const Routes = () => (
  <BrowserRouter>
    <PanelMonitoringProvider>
      <SearchReportProvider>
        <Switch>
          <Route path="/logistics/moredetails/" component={LogisticsMaisDetalhes} />
          <Route path="/" exact component={Login} />
          <Route path="/:id" component={ComponenteDinamico} />
        </Switch>
      </SearchReportProvider>
    </PanelMonitoringProvider>
  </BrowserRouter>
);

// const validateAutoLogin = ({ component: Component, ...rest }) => (
//   <Route
//     {...rest}
//     render={() => {
//       const handleWorkSchedule = (scheduleData) => {
//         try {
//           const inProgress = scheduleData.CLIENTES.find((element) => element.status === 1);
//           if (
//             scheduleData &&
//             scheduleData.HORARIOS_TRABALHO &&
//             Object.keys(scheduleData.HORARIOS_TRABALHO).length !== 0
//           ) {
//             const final = new Date();
//             if (scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA !== null) {
//               const hoursEnd = scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA?.split(':', 3);
//               final.setHours(hoursEnd[0], hoursEnd[1], hoursEnd[2]);
//             }
//             const resultFinal = diffInSeconds(new Date(), final);
//             if (resultFinal <= 0 && inProgress) {
//               return true;
//             } else {
//               return false;
//             }
//           }
//         } catch (error) {
//           return false;
//         }
//       };
//       const scheduleData = getScheduleData()
//       console.log(scheduleData)
//       let customer;
//       if (scheduleData) {
//         try {
//           customer = scheduleData.CLIENTES.find((cli) => cli.status === 1);
//         } catch (error) {
//           console.error(error);
//           return <Login />;
//         }
//       } else {
//         return <Login />;
//       }
//       const endWork = handleWorkSchedule(scheduleData);
//       if (scheduleData?.emAtendimento) {
//         try {
//           if (scheduleData?.GAA_DTA_AGENDA !== format(new Date(), 'dd/MM/yyyy')) {
//             return <Redirect to={{ pathname: '/home' }} />;
//           }

//           if (endWork && customer) {
//             return (
//               <Redirect
//                 to={{
//                   pathname: '/ServiceSearchs',
//                   state: {
//                     userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
//                     cliente: customer,
//                     forceCommit: false,
//                     pesquisas: customer?.pesquisas || scheduleData?.PESQUISAS,
//                   },
//                 }}
//               />
//             );
//           }
//         } catch (error) {
//           console.error(error);
//         }
//       }

//       if (!scheduleData.sucessStarted) {
//         return <Redirect to={{ pathname: '/home' }} />;
//       }
//       if (endWork) {
//         alerta('O horário de expediente chegou ao fim!');
//         return (
//           <Redirect
//             to={{
//               pathname: '/ServiceSearchs',
//               state: {
//                 userHours: scheduleData.HORARIOS_TRABALHO || undefined,
//                 cliente: customer,
//                 forceCommit: false,
//                 pesquisas: customer?.pesquisas === undefined ? scheduleData.PESQUISAS : customer.pesquisas,
//               },
//             }}
//           />
//         );
//       }
//       if(scheduleData?.GAA_DTA_AGENDA !== format(new Date(), 'dd/MM/yyyy')){
//         return <Redirect to={{ pathname: '/home' }} />;
//       }
//       if (!customer) {
//         return (
//           <Redirect
//             to={{
//               pathname: '/StartWorkDay',
//               state: { scheduleData, action: 'editar' },
//             }}
//           />
//         );
//       }
//       return (
//         <Redirect
//           to={{
//             pathname: '/ServiceSearchs',
//             state: {
//               userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
//               cliente: customer,
//               forceCommit: false,
//               pesquisas: customer?.pesquisas === undefined ? scheduleData?.PESQUISAS : customer.pesquisas,
//             },
//           }}
//         />
//       );
//     }}
//   />
// );

const ComponenteDinamico = ({ match }) => {
  const menus = getMenuToStorage();
  // //console.log('menus');
  // //console.log(menus);
  // //console.log('match');
  // //console.log(match);
  // //console.log('paginas');
  // //console.log(paginas);
  let Componente = undefined;
  if (paginas !== undefined) {
    for (const pagina of paginas) {
      if (
        (pagina.name !== undefined && pagina.name.toUpperCase() === String(match.params.id).toUpperCase()) ||
        (pagina.WrappedComponent !== undefined &&
          pagina.WrappedComponent.name.toUpperCase() === String(match.params.id).toUpperCase())
      ) {
        Componente = pagina;
        break;
      }
    }

    if (Componente === undefined && menus !== undefined) {
      for (const menu of menus) {
        if (menu.DME_URL != null && menu.DME_URL.toUpperCase() === String(match.url).toUpperCase()) {
          let moduloDirectFront = menu.DME_CLASSE;
          return (
            <PrivateRoute
              path={menu.DME_URL}
              exact
              component={(props) => {
                window.location.href = EnviromentVars[moduloDirectFront] + menu.DME_URL;
                return null;
              }}
            />
          );
        }
      }
    }
    if (Componente === undefined) {
      Componente = Home;
    }
  }
  return Componente ? <PrivateRoute path={match.url} component={Componente} /> : '<error 404>';
};

export default withRouter(Routes);
