import React from 'react';

const SearchReportContext = React.createContext();

export class SearchReportProvider extends React.Component {
  state = { dateInitial: new Date(), dateFinal: new Date(), reOpen: 0, typeReport: '0', idSearchsSelected: [] };

  setStateSearchReportDateInitial = async (dateInitial) => {
    this.setState({ ...this.state, dateInitial: dateInitial });
  };

  setStateSearchReportDateFinal = async (dateFinal) => {
    this.setState({ ...this.state, dateFinal: dateFinal });
  };

  setStateReOpenPageReport = async (status) => {
    this.setState({ ...this.state, reOpen: status });
  };

  setStateFilterTypeReport = async (type) => {
    this.setState({ ...this.state, typeReport: type });
  };

  setStateSearchsSelected = async (idSearchsSelected) => {
    this.setState({ ...this.state, idSearchsSelected: idSearchsSelected });
  };

  render() {
    const { dateInitial, dateFinal, reOpen, typeReport, idSearchsSelected } = this.state;

    return (
      <SearchReportContext.Provider
        value={{
          dateInitial,
          setStateDateInitial: this.setStateSearchReportDateInitial,
          dateFinal,
          setStateDateFinal: this.setStateSearchReportDateFinal,
          reOpen,
          setStateReOpenPageReport: this.setStateReOpenPageReport,
          typeReport,
          setStateFilterTypeReport: this.setStateFilterTypeReport,
          idSearchsSelected,
          setStateSearchsSelected: this.setStateSearchsSelected,
        }}
      >
        {this.props.children}
      </SearchReportContext.Provider>
    );
  }
}

export default SearchReportContext;
