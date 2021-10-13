/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '../index';
import {backend} from '../index';
import {ALL_ENVS, describeWithFlags} from '../jasmine_util';
import {expectArraysClose} from '../test_util';

describeWithFlags('round', ALL_ENVS, () => {
  it('basic', async () => {
    const a = tf.tensor1d([0.9, 2.5, 2.3, 1.5, -4.5]);
    const r = a.round();

    expectArraysClose(await r.data(), [1, 2, 2, 2, -4]);
  });

  it('int32', async () => {
    if (backend() && backend().floatPrecision() === 32) {
      // TODO: Use skip() instead when it is implemented
      const a = tf.tensor1d([-12345678, 10, 12345678], 'int32');
      const r = a.round();

      expect(r.dtype).toEqual('int32');
      expectArraysClose(await r.data(), [-12345678, 10, 12345678]);
    }
  });

  it('propagates NaNs', async () => {
    const a = tf.tensor1d([1.5, NaN, -1.4]);
    const r = tf.round(a);
    expectArraysClose(await r.data(), [2, NaN, -1]);
  });

  it('gradients: Scalar', async () => {
    const a = tf.scalar(5.2);
    const dy = tf.scalar(3);

    const gradients = tf.grad(a => tf.round(a))(a, dy);

    expect(gradients.shape).toEqual(a.shape);
    expect(gradients.dtype).toEqual('float32');
    expectArraysClose(await gradients.data(), [0]);
  });

  it('gradient with clones', async () => {
    const a = tf.scalar(5.2);
    const dy = tf.scalar(3);

    const gradients = tf.grad(a => tf.round(a.clone()).clone())(a, dy);

    expect(gradients.shape).toEqual(a.shape);
    expect(gradients.dtype).toEqual('float32');
    expectArraysClose(await gradients.data(), [0]);
  });

  it('gradients: Tensor1D', async () => {
    const a = tf.tensor1d([-1.1, 2.6, 3, -5.9]);
    const dy = tf.tensor1d([1, 2, 3, 4]);

    const gradients = tf.grad(a => tf.round(a))(a, dy);

    expect(gradients.shape).toEqual(a.shape);
    expect(gradients.dtype).toEqual('float32');
    expectArraysClose(await gradients.data(), [0, 0, 0, 0]);
  });

  it('gradients: Tensor2D', async () => {
    const a = tf.tensor2d([-3, 1, 2.2, 3], [2, 2]);
    const dy = tf.tensor2d([1, 2, 3, 4], [2, 2]);

    const gradients = tf.grad(a => tf.round(a))(a, dy);

    expect(gradients.shape).toEqual(a.shape);
    expect(gradients.dtype).toEqual('float32');
    expectArraysClose(await gradients.data(), [0, 0, 0, 0]);
  });

  it('throws when passed a non-tensor', () => {
    expect(() => tf.round({} as tf.Tensor))
        .toThrowError(/Argument 'x' passed to 'round' must be a Tensor/);
  });

  it('accepts a tensor-like object', async () => {
    const r = tf.round([0.9, 2.5, 2.3, 1.5, -4.5]);
    expectArraysClose(await r.data(), [1, 2, 2, 2, -4]);
  });

  it('throws for string tensor', () => {
    expect(() => tf.round('q'))
        .toThrowError(/Argument 'x' passed to 'round' must be numeric/);
  });
});
