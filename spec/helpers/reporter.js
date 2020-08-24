import { SpecReporter } from 'jasmine-spec-reporter';

jasmine.getEnv().clearReporters(); // remove default reporter logs
// add jasmine-spec-reporter
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
    },
  })
);
