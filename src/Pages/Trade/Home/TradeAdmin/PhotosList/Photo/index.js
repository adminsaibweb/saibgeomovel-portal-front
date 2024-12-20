import React, { Component } from 'react';
import { Icon } from 'react-materialize';
import PanelMonitoringContext from '../../../../../../providers/monitoringPanel';
import { capitalize } from '../../../../../../services/funcoes';
import { Container, DivImage, ContentNavigation, Navigator, Box, Row, ContentButtonClosePhoto } from './styled';
export default class Photo extends Component {
  static contextType = PanelMonitoringContext;

  state = {
    orientation: window.orientation,
  };

  componentDidMount() {
    const { setForceLoading } = this.context
    if (this.props.withNavigation) {
      setForceLoading(true)
    }
    this.setState({
      orientation: window.orientation,
    });
  }

  componentDidUpdate() {
    if (this.state.orientation !== window.orientation) {
      this.setState({
        orientation: window.orientation,
      });
    }
  }

  render() {
    const { pathImage, closePhoto, withNavigation, disableNavigateBefore, disableNavigateAfter, descriptionPhoto } =
      this.props;
    const { isMobile, setForceLoading } = this.context;
    const { orientation } = this.state;

    return (
      <Container isMobile={isMobile}>
        <Box />

        {withNavigation && withNavigation ? (
          <>
            <ContentNavigation className="contentNavigation" isMobile={isMobile}>
              <DivImage orientation={orientation} withNavigation isMobile={isMobile}>
                <ContentButtonClosePhoto onClick={() => {
                  closePhoto()
                  setForceLoading(false)
                }} rientation={orientation}>
                  <Icon>close</Icon>
                </ContentButtonClosePhoto>

                <img src={pathImage} alt="Foto" />
              </DivImage>
              <p>{capitalize(descriptionPhoto, true)}</p>
              <Navigator
                left="5%"
                disabled={disableNavigateBefore}
                onClick={() => !disableNavigateBefore && this.props.handleNavigatePhoto('before')}
              >
                <Icon medium>navigate_before</Icon>
              </Navigator>
              <Navigator
                right="5%"
                disabled={disableNavigateAfter}
                onClick={() => !disableNavigateAfter && this.props.handleNavigatePhoto('after')}
              >
                <Icon medium>navigate_next</Icon>
              </Navigator>
            </ContentNavigation>

            <Row></Row>
          </>
        ) : (
          <DivImage withNavigation={false} orientation={orientation}>
            <img src={pathImage} alt="Foto" />
          </DivImage>
        )
        }

        <Box />
      </Container >
    );
  }
}
