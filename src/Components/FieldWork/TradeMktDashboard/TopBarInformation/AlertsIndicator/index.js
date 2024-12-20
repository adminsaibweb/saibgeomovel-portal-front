import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ContentCardAlerts, TotalAlerts, Separator, ContentDetailsAlerts, Content } from './styled';

export default class AlertsIndicator extends Component {
  state = {
    loading: false,
    countAlerts: 0,
    countAlertsReaded: 0,
    countAlertsPeding: 0,
  };

  componentDidMount() {
    this.handleAlerts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.alerts !== this.props.alerts) {
      this.setState({
        loading: true,
      });
      this.handleAlerts().then(() =>
        setTimeout(() => {
          this.setState({
            loading: false,
          });
        }, 600)
      );
    }

    if (prevProps.forceLoading !== this.props.forceLoading) {
      this.setState({
        loading: this.props.forceLoading,
      });
    }
  }

  handleAlerts = async () => {
    const { alerts } = this.props;
    this.setState({
      countAlerts: alerts.filter((alert) => alert.descricao !== '').length,
      countAlertsReaded: alerts.filter((alert) => alert.descricao !== '' && alert.status === 1).length,
      countAlertsPeding: alerts.filter((alert) => alert.descricao !== '' && alert.status === 0).length,
    });
  };

  render() {
    const { countAlerts, countAlertsReaded, countAlertsPeding, loading } = this.state;

    return (
      <Content>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={60} width={180} />
          </div>
        ) : (
          <ContentCardAlerts>
            <TotalAlerts>
              <p>Alertas</p>
              <span>{`${countAlerts}`}</span>
            </TotalAlerts>

            <Separator />
            <ContentDetailsAlerts>
              <div>
                <span>{`${countAlertsReaded}`}</span>
                <p>Lidos/resolvidos</p>
              </div>
              <div>
                <span>{`${countAlertsPeding}`}</span>
                <p>Pendentes</p>
              </div>
            </ContentDetailsAlerts>
          </ContentCardAlerts>
        )}
      </Content>
    );
  }
}
