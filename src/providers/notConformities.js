import React from 'react';

const NotConformitiesContext = React.createContext();

export class NotConformitiesProvider extends React.Component {
  state = {};
  constructor(props) {
    super(props);
    this.state = { notConformities: undefined, indexPage: undefined, idSelected: undefined };
  }

  setStateIndexPage = async (newIndexPage) => {
    this.setState({ ...this.state, indexPage: newIndexPage });
  };

  setStateIdSelected = async (newIdSelected) => {
    this.setState({ ...this.state, idSelected: newIdSelected });
  };

  setStateNotConformities = async (newNotConformities) => {
    this.setState({ ...this.state, notConformities: newNotConformities });
  };

  render() {
    const { notConformities, indexPage, idSelected } = this.state;

    return (
      <NotConformitiesContext.Provider
        value={{
          notConformities,
          indexPage,
          idSelected,
          setStateIndexPage: this.setStateIndexPage,
          setStateIdSelected: this.setStateIdSelected,
          setStateNotConformities: this.setStateNotConformities,
        }}
      >
        {this.props.children}
      </NotConformitiesContext.Provider>
    );
  }
}

export default NotConformitiesContext;
