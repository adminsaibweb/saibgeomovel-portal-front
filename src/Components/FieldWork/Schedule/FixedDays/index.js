import React, { Component } from 'react';
import { Container, ContentDay } from './styled';

export default class FixedDays extends Component {
  state = {
    daysSelected: [],
  };

  verifyIfHasBeenAdd = (position) => {
    const { daysSelected } = this.state;

    return daysSelected.find((item) => item === position);
  };

  onChange = async (position) => {
    const { daysSelected } = this.state;

    const itemIsAdd = this.verifyIfHasBeenAdd(position);

    if (itemIsAdd !== undefined) {
      const newItems = daysSelected.filter((item) => item !== position);

      this.setState(
        {
          daysSelected: newItems,
        },
        async () => await this.props.onChange(this.state.daysSelected)
      );
    } else {
      this.setState(
        (prevState) => ({
          ...prevState,
          daysSelected: [...prevState.daysSelected, position],
        }),
        async () => await this.props.onChange(this.state.daysSelected)
      );
    }
  };

  render() {
    const daysOfWeek = [
      { day: 'D', selected: false },
      { day: 'S', selected: false },
      { day: 'T', selected: false },
      { day: 'Q', selected: false },
      { day: 'Q', selected: false },
      { day: 'S', selected: false },
      { day: 'S', selected: false },
    ];

    const { daysSelected } = this.state;

    return (
      <Container {...this.props}>
        {daysOfWeek.map((item, i) => (
          <ContentDay
            selected={daysSelected.includes(i)}
            onClick={async () => {
              await this.onChange(i);
            }}
            key={i}
          >
            {item.day}
          </ContentDay>
        ))}
      </Container>
    );
  }
}
