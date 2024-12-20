import React from 'react';

const ExcelSearchsReportsContext = React.createContext();

export class ExcelSearchsReportsProvider extends React.Component {
  state = {};
  constructor(props){
    super(props);
    this.state = { dateInitial: new Date(), dateFinal: new Date(), reOpen: 0, typeReport: '0', idSearchsSelected: [] };
  }

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
      <ExcelSearchsReportsContext.Provider
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
      </ExcelSearchsReportsContext.Provider>
    );
  }
}

export default ExcelSearchsReportsContext;
