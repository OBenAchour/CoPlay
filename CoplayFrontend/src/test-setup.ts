import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);

(TestBed as any).configureTestingModule = function (moduleDef: any) {
  const existingImports: any[] = moduleDef?.imports ?? [];
  const existingSchemas: any[] = moduleDef?.schemas ?? [];

  const hasHttp = existingImports.some(
    (m: any) => m === HttpClientTestingModule || (m && m.ngModule === HttpClientTestingModule)
  );
  const hasRouter = existingImports.some(
    (m: any) => m === RouterTestingModule || (m && m.ngModule === RouterTestingModule)
  );

  return originalConfigureTestingModule({
    ...moduleDef,
    imports: [
      ...existingImports,
      ...(hasHttp ? [] : [HttpClientTestingModule]),
      ...(hasRouter ? [] : [RouterTestingModule]),
    ],
    schemas: [...existingSchemas, CUSTOM_ELEMENTS_SCHEMA],
  });
};
