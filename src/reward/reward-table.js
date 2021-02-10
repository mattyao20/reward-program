import React from 'react';

import get from 'lodash/get';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import transactions from '../data';

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
      margin: 30,
    },
    container: {
        minHeight: 500,
        maxHeight: 500,
    },
  });

const calPoints = (money) => {
    if(money >100) {
      return (2 * (money - 100) + 50);
    } else if(money >= 50 && money < 100) {
      return money - 50;
    }
    return 0
};

const transByNameAndMonth = (trans) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const list = trans.reduce((acc,obj) => {
        obj = {...obj, month: months[new Date(obj['date']).getUTCMonth()], point: calPoints(obj['money'])};
        const property = obj['name'];
        acc[property] = acc[property] || [];
        acc[property].push(obj);
        acc[property] = acc[property].sort((a, b) => new Date(a.date) - new Date(b.date));
        return acc;
    }, {});
    for(let [key] of Object.entries(list)) {
        const newList = list[key].reduce((acc,obj) => {
            const property = obj['month'];
            acc[property] = acc[property] || [];
            acc[property].push(obj);
            return acc;
        }, {});
        list[key] = newList;
    };
    return list;
};

const sumByCustomerPerMonth = (trans) => {
    const sumList = transByNameAndMonth(trans);
    let listByCustomerPerMonth = [];
    for(let [key, value] of Object.entries(sumList)) {
        for(let [k] of Object.entries(value)) {
            let monthlySumByCustomer = {};
            const points = value[k].reduce((a, obj) => a + (obj['point'] || 0), 0);
            monthlySumByCustomer = {id: `${key} + ${k}`, name: key, month: k, numOfTrans: value[k].length, pointsPerMonth: points};
            listByCustomerPerMonth.push(monthlySumByCustomer);
        }
    }
    return listByCustomerPerMonth;
};

const summaryByCustomer = () => {
    let totalPoints = {};
    let arr1 = [];
    const arr = sumByCustomerPerMonth(transactions);
    for (var i = 0; i < arr.length; i++) {
        var obj = arr[i];
        totalPoints[obj.name] = totalPoints[obj.name] === undefined ? 0 : totalPoints[obj.name];
        totalPoints[obj.name] += parseInt(obj.pointsPerMonth);
    }
    for (var i = 0; i < totalPoints.length; i++) {
        arr1.push(totalPoints[i].name);
    }
    return Object.entries(totalPoints).map((arr, i) => { 
        return {'name': arr[0], 'points': arr[1]}
    });
};

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();
  const obj = transByNameAndMonth(transactions);
  const rowTransHistory = get(obj, [row.name, row.month])

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="center">{row.month}</TableCell>
        <TableCell align="center">{row.numOfTrans}</TableCell>
        <TableCell align="center">{row.pointsPerMonth}</TableCell>
        </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                {`History of ${row.month}`}
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Money Spent</TableCell>
                    <TableCell>Reward Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowTransHistory.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.name}
                      </TableCell>
                      <TableCell>{historyRow.date}</TableCell>
                      <TableCell>{historyRow.money}</TableCell>
                      <TableCell>{historyRow.point}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default function RewardTable() {
  const classes = useRowStyles();
  const monthlyRows = sumByCustomerPerMonth(transactions);
  const totalRows = summaryByCustomer();

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h4" gutterBottom>
        Reward Points by Customer per Month
        </Typography>
        <TableContainer className={classes.container}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align="center">Month</TableCell>
              <TableCell align="center">Number of Transactions</TableCell>
              <TableCell align="center">Reward Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthlyRows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
      <Paper className={classes.root}>
        <Typography variant="h4" gutterBottom>
          Total Reward Points by Customer
        </Typography>
        <TableContainer className={classes.container}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell >Total Reward Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {totalRows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>
    </>
  );
};
