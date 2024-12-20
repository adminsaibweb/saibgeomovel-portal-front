import React from 'react';
import { dateFormat } from '../services/funcoes';

const PanelMonitoringContext = React.createContext();

export class PanelMonitoringProvider extends React.Component {
  state = {
    statePanelMonitoring: {
      daySelected: dateFormat(new Date(), 'DD/MM/yyyy'),
      typeFilter: '1',
      lineClicked: 0,
      orderPosition: 'asc',
      filtering: false,
      scheduleData: [],

      size: [0, 0],
    },
    stateProfessionalScheduleData: {},
    setStatePanelMonitoring: this.setStatePanelMonitoring,
    isMobile: false,
    forceLoading: false
  };

  componentDidMount() {
    this.useWindowSize();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.size !== prevState.size) {
      const isMobile = this.verifyIsMobie();
      await this.setIsMobile(isMobile);
      this.setState({
        isMobile,
      });
    }
  }

  verifyIsMobie = () => {
    const [width, height] = this.state.size;

    if (width <= 768 && height <= 1024) {
      return true;
    } else {
      return false;
    }
  };

  setForceLoading = (value) => {
    this.setState({ forceLoading: value })
  }

  useWindowSize = () => {
    const { size } = this.state;
    const updateSize = () => {
      this.setState({
        size: [window.outerWidth, window.outerHeight],
      });
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    return size;
  };

  setIsMobile = async (isMobile) => {
    this.setState({ ...this.state, isMobile });
  };

  setStatePanelMonitoring = async (statePanel) => {
    this.setState({ ...this.state, statePanelMonitoring: statePanel });
  };

  setStateProfessionalData = async (stateProfessionalSchedule) => {
    this.setState({
      ...this.state,
      stateProfessionalScheduleData: stateProfessionalSchedule,
    });
  };

  render() {
    const { statePanelMonitoring, stateProfessionalScheduleData, isMobile, forceLoading } = this.state;
    return (
      <PanelMonitoringContext.Provider
        value={{
          setStatePanelMonitoring: this.setStatePanelMonitoring,
          statePanelMonitoring,
          setStateProfessionalData: this.setStateProfessionalData,
          stateProfessionalScheduleData,
          setIsMobile: this.setIsMobile,
          isMobile,
          forceLoading,
          setForceLoading: this.setForceLoading
        }}
      >
        {this.props.children}
      </PanelMonitoringContext.Provider>
    );
  }
}

export default PanelMonitoringContext;
