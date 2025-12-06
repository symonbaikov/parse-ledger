'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import apiClient from '../lib/api';

interface DailyReport {
  date: string;
  income: {
    totalAmount: number;
    transactionCount: number;
    topCounterparties: Array<{
      name: string;
      amount: number;
      count: number;
    }>;
  };
  expense: {
    totalAmount: number;
    transactionCount: number;
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      count: number;
    }>;
  };
  summary: {
    incomeTotal: number;
    expenseTotal: number;
    difference: number;
    balance?: number;
  };
}

interface MonthlyReport {
  month: string;
  year: number;
  dailyTrends: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  counterpartyDistribution: Array<{
    counterpartyName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  comparison: {
    currentPeriod: {
      income: number;
      expense: number;
      difference: number;
    };
    previousPeriod: {
      income: number;
      expense: number;
      difference: number;
    };
    change: {
      incomeChange: number;
      expenseChange: number;
      differenceChange: number;
      incomeChangePercent: number;
      expenseChangePercent: number;
      differenceChangePercent: number;
    };
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    difference: number;
    transactionCount: number;
  };
}

interface CustomReport {
  dateFrom: string;
  dateTo: string;
  groupBy: string;
  groups: Array<{
    key: string;
    label: string;
    totalAmount: number;
    transactionCount: number;
    transactions: Array<{
      id: string;
      date: string;
      counterparty: string;
      amount: number;
      category?: string;
      branch?: string;
      wallet?: string;
    }>;
  }>;
  summary: {
    totalIncome: number;
    totalExpense: number;
    difference: number;
    transactionCount: number;
  };
}

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [customReport, setCustomReport] = useState<CustomReport | null>(null);
  const [dailyDate, setDailyDate] = useState<string>('');
  const [monthlyYear, setMonthlyYear] = useState<number | ''>('');
  const [monthlyMonth, setMonthlyMonth] = useState<number | ''>('');
  const [customDateFrom, setCustomDateFrom] = useState<string>(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [customDateTo, setCustomDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customGroupBy, setCustomGroupBy] = useState('day');
  const [initialized, setInitialized] = useState(false);

  const hydrateWithLatestPeriod = async () => {
    try {
      const resp = await apiClient.get('/reports/latest');
      const latestDate = resp.data?.date;
      const latestYear = resp.data?.year;
      const latestMonth = resp.data?.month;

      if (latestDate) {
        setDailyDate(latestDate);
        setCustomDateTo(latestDate);
      }
      if (latestYear && latestMonth) {
        setMonthlyYear(latestYear);
        setMonthlyMonth(latestMonth);
      }
    } catch (err) {
      // keep defaults
    } finally {
      setInitialized(true);
    }
  };

  const loadDailyReport = async (dateOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const dateToUse = dateOverride || dailyDate || 'latest';
      const response = await apiClient.get(`/reports/daily?date=${dateToUse}`);
      setDailyReport(response.data);
      if (!dailyDate && dateToUse !== 'latest') {
        setDailyDate(dateToUse);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки отчёта');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async (yearOverride?: number, monthOverride?: number) => {
    setLoading(true);
    setError(null);
    try {
      const yearToUse = yearOverride ?? monthlyYear;
      const monthToUse = monthOverride ?? monthlyMonth;
      const response = await apiClient.get(`/reports/monthly?year=${yearToUse}&month=${monthToUse}`);
      setMonthlyReport(response.data);
      if (!monthlyYear && yearToUse) setMonthlyYear(yearToUse);
      if (!monthlyMonth && monthToUse) setMonthlyMonth(monthToUse);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки отчёта');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/reports/custom', {
        dateFrom: customDateFrom,
        dateTo: customDateTo,
        groupBy: customGroupBy,
      });
      setCustomReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки отчёта');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'excel' | 'csv') => {
    try {
      let url = '/reports/export';
      let body: any = { format };

      if (tab === 2 && customDateFrom && customDateTo) {
        body.dateFrom = customDateFrom;
        body.dateTo = customDateTo;
      }

      const response = await apiClient.post(url, body, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setError('Ошибка экспорта отчёта');
    }
  };

  useEffect(() => {
    hydrateWithLatestPeriod();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (tab === 0) {
      loadDailyReport();
    } else if (tab === 1) {
      loadMonthlyReport();
    }
  }, [tab, initialized]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const normalizeSummary = (
    summary: DailyReport['summary'] | MonthlyReport['summary'] | CustomReport['summary'] | null | undefined,
  ) => {
    if (!summary) {
      return null;
    }
    if ('incomeTotal' in summary) {
      return {
        income: summary.incomeTotal,
        expense: summary.expenseTotal,
        difference: summary.difference,
      };
    }
    return {
      income: summary.totalIncome,
      expense: summary.totalExpense,
      difference: summary.difference,
    };
  };

  const renderHeroSummary = () => {
    const summary =
      tab === 0
        ? dailyReport?.summary
        : tab === 1
          ? monthlyReport?.summary
          : customReport?.summary;

    const normalized = normalizeSummary(summary);

    if (!normalized) return null;

    return (
      <Box
        sx={{
          mt: 2,
          mb: 3,
          p: 3,
          borderRadius: 3,
          background:
            'linear-gradient(120deg, rgba(68,138,255,0.12), rgba(76,175,80,0.12), rgba(244,67,54,0.1))',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Приходы
            </Typography>
            <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
              {formatCurrency(normalized.income || 0)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Расходы
            </Typography>
            <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
              {formatCurrency(normalized.expense || 0)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Итоговый денежный поток
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={normalized.difference >= 0 ? 'Плюс' : 'Минус'}
                color={normalized.difference >= 0 ? 'success' : 'error'}
                size="small"
              />
              <Typography
                variant="h5"
                color={normalized.difference >= 0 ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 700 }}
              >
                {formatCurrency(normalized.difference)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderTopList = (
    title: string,
    items: Array<{ label: string; value: number; extra?: string }>,
    color: 'success' | 'error' | 'primary' = 'primary',
    total?: { label: string; value: number; extra?: string },
  ) => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          {total && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                {total.label}
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} color={`${color}.main`}>
                {formatCurrency(total.value)}
              </Typography>
              {total.extra && (
                <Typography variant="caption" color="text.secondary">
                  {total.extra}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
        <Stack spacing={1.5} mt={1}>
          {items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.25,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip size="small" label={idx + 1} color={color} variant="outlined" />
                <Typography variant="body2" sx={{ maxWidth: 220 }}>
                  {item.label}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                {item.extra && (
                  <Typography variant="caption" color="text.secondary">
                    {item.extra}
                  </Typography>
                )}
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(item.value)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Отчёты
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сводка приходов, расходов и чистого денежного потока
          </Typography>
        </Box>
        <Chip
          color="primary"
          variant="outlined"
          label={tab === 0 ? 'День' : tab === 1 ? 'Месяц' : 'Период'}
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Ежедневный отчёт" />
          <Tab label="Месячный отчёт" />
          <Tab label="Пользовательский отчёт" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderHeroSummary()}

          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Дата"
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={() => loadDailyReport()} disabled={loading}>
                  Загрузить
                </Button>
                  {dailyReport && (
                    <>
                      <Button variant="outlined" onClick={() => exportReport('excel')}>
                        Экспорт Excel
                      </Button>
                      <Button variant="outlined" onClick={() => exportReport('csv')}>
                        Экспорт CSV
                      </Button>
                    </>
                  )}
                </Box>

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}

                {dailyReport && !loading && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      {renderTopList(
                        'Приходы за день',
                        dailyReport.income.topCounterparties.slice(0, 5).map((cp) => ({
                          label: cp.name,
                          value: cp.amount,
                          extra: `${cp.count} операций`,
                        })),
                        'success',
                        {
                          label: 'Сумма приходов',
                          value: dailyReport.income.totalAmount,
                          extra: `${dailyReport.income.transactionCount} операций`,
                        },
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      {renderTopList(
                        'Расходы за день (категории)',
                        dailyReport.expense.topCategories.slice(0, 5).map((cat) => ({
                          label: cat.categoryName,
                          value: cat.amount,
                          extra: `${cat.count} операций`,
                        })),
                        'error',
                        {
                          label: 'Сумма расходов',
                          value: dailyReport.expense.totalAmount,
                          extra: `${dailyReport.expense.transactionCount} операций`,
                        },
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Итоги дня
                          </Typography>
                          <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Приход
                              </Typography>
                              <Typography variant="subtitle1" color="success.main" fontWeight={700}>
                                {formatCurrency(dailyReport.summary.incomeTotal)}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Расход
                              </Typography>
                              <Typography variant="subtitle1" color="error.main" fontWeight={700}>
                                {formatCurrency(dailyReport.summary.expenseTotal)}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" fontWeight={600}>
                                Чистый поток
                              </Typography>
                              <Chip
                                color={dailyReport.summary.difference >= 0 ? 'success' : 'error'}
                                label={formatCurrency(dailyReport.summary.difference)}
                              />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                  <TextField
                    label="Год"
                    type="number"
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(parseInt(e.target.value, 10))}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Месяц"
                    type="number"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(parseInt(e.target.value, 10))}
                    inputProps={{ min: 1, max: 12 }}
                    sx={{ width: 120 }}
                  />
                  <Button variant="contained" onClick={() => loadMonthlyReport()} disabled={loading}>
                    Загрузить
                  </Button>
                  {monthlyReport && (
                    <>
                      <Button variant="outlined" onClick={() => exportReport('excel')}>
                        Экспорт Excel
                      </Button>
                      <Button variant="outlined" onClick={() => exportReport('csv')}>
                        Экспорт CSV
                      </Button>
                    </>
                  )}
                </Box>

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}

                {monthlyReport && !loading && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Сводка за месяц
                          </Typography>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Приходы
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                {formatCurrency(monthlyReport.summary.totalIncome)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Расходы
                              </Typography>
                              <Typography variant="h6" color="error.main">
                                {formatCurrency(monthlyReport.summary.totalExpense)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Разница
                              </Typography>
                              <Typography
                                variant="h6"
                                color={monthlyReport.summary.difference >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatCurrency(monthlyReport.summary.difference)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Операций
                              </Typography>
                              <Typography variant="h6">
                                {monthlyReport.summary.transactionCount}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderTopList(
                        'Распределение по категориям',
                        monthlyReport.categoryDistribution.slice(0, 10).map((cat) => ({
                          label: cat.categoryName,
                          value: cat.amount,
                          extra: `${cat.percentage.toFixed(1)}% • ${cat.transactionCount} операций`,
                        })),
                        'primary',
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      {renderTopList(
                        'Топ контрагентов',
                        monthlyReport.counterpartyDistribution.slice(0, 10).map((cp) => ({
                          label: cp.counterpartyName,
                          value: cp.amount,
                          extra: `${cp.percentage.toFixed(1)}% • ${cp.transactionCount} операций`,
                        })),
                        'success',
                      )}
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}

          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="Дата начала"
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Дата окончания"
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  label="Группировка"
                  value={customGroupBy}
                  onChange={(e) => setCustomGroupBy(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="day">По дням</MenuItem>
                  <MenuItem value="category">По категориям</MenuItem>
                  <MenuItem value="counterparty">По контрагентам</MenuItem>
                  <MenuItem value="branch">По филиалам</MenuItem>
                  <MenuItem value="wallet">По кошелькам</MenuItem>
                </TextField>
                <Button variant="contained" onClick={loadCustomReport} disabled={loading}>
                  Загрузить
                </Button>
                  {customReport && (
                    <>
                      <Button variant="outlined" onClick={() => exportReport('excel')}>
                        Экспорт Excel
                      </Button>
                      <Button variant="outlined" onClick={() => exportReport('csv')}>
                        Экспорт CSV
                      </Button>
                    </>
                  )}
                </Box>

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}

                {customReport && !loading && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Сводка
                          </Typography>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Приходы
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                {formatCurrency(customReport.summary.totalIncome)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Расходы
                              </Typography>
                              <Typography variant="h6" color="error.main">
                                {formatCurrency(customReport.summary.totalExpense)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Разница
                              </Typography>
                              <Typography
                                variant="h6"
                                color={customReport.summary.difference >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatCurrency(customReport.summary.difference)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                Операций
                              </Typography>
                              <Typography variant="h6">
                                {customReport.summary.transactionCount}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Группы
                          </Typography>
                          {customReport.groups.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                              Нет операций за выбранный период
                            </Typography>
                          )}
                          {customReport.groups.length > 0 &&
                            customReport.groups.map((group, idx) => {
                              const maxAbsValue = Math.max(
                                1,
                                ...customReport.groups.map((g) => Math.abs(g.totalAmount || 0)),
                              );
                              const progressValue = Math.min(
                                100,
                                Math.round((Math.abs(group.totalAmount || 0) / maxAbsValue) * 100),
                              );

                              return (
                                <Box
                                  key={idx}
                                  sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    background:
                                      group.totalAmount >= 0
                                        ? 'linear-gradient(120deg, rgba(76,175,80,0.05), rgba(76,175,80,0.02))'
                                        : 'linear-gradient(120deg, rgba(244,67,54,0.05), rgba(244,67,54,0.02))',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {group.label}
                                    </Typography>
                                    <Chip
                                      color={group.totalAmount >= 0 ? 'success' : 'error'}
                                      label={formatCurrency(group.totalAmount)}
                                    />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {group.transactionCount} операций
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={progressValue}
                                    sx={{
                                      height: 8,
                                      borderRadius: 5,
                                      backgroundColor: 'rgba(0,0,0,0.04)',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: group.totalAmount >= 0 ? '#4caf50' : '#f44336',
                                      },
                                    }}
                                  />
                                </Box>
                              );
                            })}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
  );
}
